import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferDto } from './dto/transfer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(userId: string) {
    return this.prisma.wallet.create({
      data: {
        userId,
        balance: 0.00,
        currency: 'MXN',
      },
    });
  }

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    return {
      walletId: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async transferFunds(senderUserId: string, transferDto: TransferDto) {
    const { receiverUserId, currency, amount, description } = transferDto;

    if (senderUserId === receiverUserId) {
      throw new BadRequestException("Can't make a transfer to myself");
    }

    const transferAmount = new Prisma.Decimal(amount);

    return await this.prisma.$transaction(async (tx) => {
      const sourceAccount = await tx.account.findUnique({
        where: {
          userId_currency: { userId: senderUserId, currency },
        },
      });

      if (!sourceAccount) {
        throw new NotFoundException(
          `Dont have a configured account with the currency ${currency}`,
        );
      }

      if (sourceAccount.balance.lessThan(transferAmount)) {
        throw new BadRequestException(
          'Insufficient founds to make the transfer',
        );
      }

      const destinationAccount = await tx.account.findUnique({
        where: {
          userId_currency: { userId: receiverUserId, currency },
        },
      });

      if (!destinationAccount) {
        throw new NotFoundException(
          `The destination user dont have with a active account with ${currency}.`,
        );
      }

      const updatedSource = await tx.account.update({
        where: { id: sourceAccount.id },
        data: {
          balance: { decrement: transferAmount },
        },
      });

      await tx.account.update({
        where: { id: destinationAccount.id },
        data: {
          balance: { increment: transferAmount },
        },
      });

      await tx.wallet.update({
        where: { userId: senderUserId },
        data: { balance: { decrement: transferAmount } },
      });

      await tx.wallet.update({
        where: { userId: receiverUserId },
        data: { balance: { increment: transferAmount } },
      });

      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          description: description || 'Transfer between users',
          amount: transferAmount,
          currency,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destinationAccount.id,
        },
      });

      return {
        message: 'Transfer processed and audited successfully',
        receipt: {
          transactionId: ledgerEntry.id,
          currency,
          amountTranferred: amount,
          senderNewBalance: updatedSource.balance,
          createdAt: ledgerEntry.createdAt,
        },
      };
    });
  }
}
