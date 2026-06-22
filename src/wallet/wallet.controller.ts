import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req: any) {
    const userId = req.user.userId;
    return this.walletService.getBalance(userId);
  }
}
