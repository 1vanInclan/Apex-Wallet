import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Request() req: any) {
    const userId = req.user.userId;
    return this.walletService.getBalance(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('transfer')
  async makeTransfer(@Req() req: any, @Body() transferDto: TransferDto){
    console.log('Datos del usuario en el Request:', req.user);
    const senderUserId = req.user.userId;
    console.log('ID del emisor detectado:', senderUserId);
    return this.walletService.transferFunds(senderUserId, transferDto);
  }
}
