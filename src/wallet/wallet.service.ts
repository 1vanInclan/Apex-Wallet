import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
