import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class FxService {
  private readonly rates: Record<string, number> = {
    'MXN_MXN': 1,
    'USD_USD': 1,
    'EUR_EUR': 1,
    'USD_MXN': 18.00,
    'MXN_USD': 1 / 18.00,
    'EUR_MXN': 20.00,
    'MXN_EUR': 1 / 20.00,
    'USD_EUR': 0.90,
    'EUR_USD': 1.11,
  };

  getExchangeRate(from: string, to: string): Prisma.Decimal {
    const pair = `${from}_${to}`;
    const rate = this.rates[pair];

    if (!rate) {
      throw new Error(`Exchange rate not found for pair ${pair}`);
    }

    return new Prisma.Decimal(rate);
  }

  convert(amount: Prisma.Decimal, from: string, to: string): Prisma.Decimal {
    if (from === to) return amount;
    const rate = this.getExchangeRate(from, to);
    return amount.mul(rate);
  }
}
