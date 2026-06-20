import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (email === 'admin@apex.com' && password === 'password123') {
      const payload = { sub: 1, email: email };

      return {
        access_token: this.jwtService.sign(payload),
        user: { id: 1, email },
      };
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }
}
