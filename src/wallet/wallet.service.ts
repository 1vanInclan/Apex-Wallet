import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferDto } from './dto/transfer.dto';
import { Prisma } from '@prisma/client';
import { FxService } from './fx.service';
import { GetHistoryQueryDto, TransactionTypeFilter } from './dto/history.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxService: FxService,
  ) {}

  async getWalletHistory(userId: string, query: GetHistoryQueryDto){
    const { page = 1, limit = 10, currency, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const whereConditions: any = {
      OR: [{ sourceAccount: { userId } }, { destinationAccount: { userId } }],
    };

    if (type === TransactionTypeFilter.INCOME) {
      whereConditions.OR = [{ destinationAccount: { userId } }];
    } else if (type === TransactionTypeFilter.EXPENSE) {
      whereConditions.OR = [{ sourceAccount: { userId } }]
    }

    if (currency) {
      if (type === TransactionTypeFilter.INCOME) {
        whereConditions.receiverCurrency = currency;
      } else if (type === TransactionTypeFilter.EXPENSE) {
        whereConditions.senderCurrency = currency;
      } else {
        whereConditions.AND = [
          {
            OR: [{ senderCurrency: currency }, { receiverCurrency: currency }],
          },
        ];
      }
    }

    if (startDate || endDate) {
      whereConditions.createdAt = {};
      if (startDate) whereConditions.createdAt.gte = new Date(startDate);
      if (endDate) whereConditions.createdAt.lte = new Date(endDate);
    }

    const [entries, totalItems] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sourceAccount: true,
          destinationAccount: true,
        },
      }),
      this.prisma.ledgerEntry.count({ where: whereConditions })
    ]);

    const formattedData = entries.map( (entry) => {
      const isIncome = entry.destinationAccount.userId === userId;

      return {
        id: entry.id,
        description: entry.description,
        amount: entry.amount,
        convertedAmount: entry.convertedAmount,
        exchangeRate: entry.exchangeRate,
        createdAt: entry.createdAt,
        type: isIncome ? 'income' : 'expense',
        currency: isIncome ? entry.receiverCurrency : entry.senderCurrency,
        metadata: {
          fromAccount: entry.sourceAccount.currency,
          toAccount: entry.destinationAccount.currency,
        },
      };
    });

    return {
      data: formattedData,
      meta: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        limit,
      },
    };
  }

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
