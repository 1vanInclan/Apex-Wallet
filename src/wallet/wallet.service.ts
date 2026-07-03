import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferDto } from './dto/transfer.dto';
import { Prisma } from '@prisma/client';
import { FxService } from './fx.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxService: FxService,
  ) {}

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
    const {
      receiverUserId,
      senderCurrency,
      receiverCurrency,
      amount,
      description,
    } = transferDto;

    if (senderUserId === receiverUserId) {
      throw new BadRequestException("Can't make a transfer to myself");
    }

    const transferAmount = new Prisma.Decimal(amount);

    return await this.prisma.$transaction(async (tx) => {
      const senderAccount = await tx.account.findUnique({
        where: {
          userId_currency: { userId: senderUserId, currency: senderCurrency },
        },
      });

      if (!senderAccount) {
        throw new NotFoundException(
          `Dont have a configured account with the currency ${senderCurrency}`,
        );
      }

      if (senderAccount.balance.lessThan(transferAmount)) {
        throw new BadRequestException(
          'Insufficient founds to make the transfer',
        );
      }

      const receiverAccount = await tx.account.findUnique({
        where: {
          userId_currency: {
            userId: receiverUserId,
            currency: receiverCurrency,
          },
        },
      });

      if (!receiverAccount) {
        throw new NotFoundException(
          `The destination user dont have with a active account with ${receiverCurrency}.`,
        );
      }

      let convertedAmount = transferAmount;
      let exchangeRate = new Prisma.Decimal(1.0000);

      if (senderCurrency !== receiverCurrency) {
        exchangeRate = this.fxService.getExchangeRate(
          senderCurrency,
          receiverCurrency,
        );
        convertedAmount = transferAmount.mul(exchangeRate);
      }

      const updatedSource = await tx.account.update({
        where: { id: senderAccount.id },
        data: {
          balance: { decrement: transferAmount },
        },
      });

      await tx.account.update({
        where: { id: receiverAccount.id },
        data: {
          balance: { increment: convertedAmount },
        },
      });

      await tx.wallet.update({
        where: { userId: senderUserId },
        data: { balance: { decrement: transferAmount } },
      });

      await tx.wallet.update({
        where: { userId: receiverUserId },
        data: { balance: { increment: convertedAmount } },
      });

      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          description: description || 'Transfer between users',
          amount: transferAmount,
          senderCurrency,
          receiverCurrency,
          convertedAmount: convertedAmount,
          exchangeRate: exchangeRate,
          sourceAccountId: senderAccount.id,
          destinationAccountId: receiverAccount.id,
        },
      });

      return {
        message: 'Transfer processed and audited successfully',
        receipt: {
          transactionId: ledgerEntry.id,
          debited: `${transferAmount.toFixed(2)} ${senderCurrency}`,
          credited: `${convertedAmount.toFixed(4)} ${receiverCurrency}`,
          rate: exchangeRate.toFixed(4),
        },
      };
    });
  }
}
