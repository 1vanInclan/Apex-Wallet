import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });

      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'The email address is already registered',
          );
        }
      }
      throw new InternalServerErrorException(
        ' Something went wrong creating the user ',
      );
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const {password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { email, password, ...resData } = updateUserDto;
    const updateData: any = { ...resData };

    if (email) {
      updateData.email = email.toLowerCase().trim();
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt)
    }

    try {
      const updateUser = await this.prisma.user.update({
        where: { id },
        data: updateData
      });

      const { password: _, ...userWithoutPassword } = updateUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'The email address is already in use by another user',
          );
        }
      }
      throw new InternalServerErrorException(
        'Something went wrong updatring the user',
      );
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `User with ID ${id} has been successfully deleted` };
  }
}
