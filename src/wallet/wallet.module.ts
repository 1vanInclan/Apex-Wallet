import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FxService } from './fx.service';

@Module({
  imports: [PrismaModule],
  providers: [WalletService, FxService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
