import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, WalletModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
