import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Length, Min } from "class-validator";

export class TransferDto {
  @IsUUID('4', { message: 'The id of destiny wallet must be a valid UUID' })
  @IsNotEmpty({ message: 'The destiny wallet is required' })
  receiverUserId: string;

  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  senderCurrency: string;

  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  receiverCurrency: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString({ message: 'The description must be a valid text' })
  description?: string;
}
