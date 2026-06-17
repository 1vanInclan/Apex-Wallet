import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database connected');
    } catch (error) {
      console.error('Conection error to the database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
