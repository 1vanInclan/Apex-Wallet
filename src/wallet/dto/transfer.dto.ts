import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator";

export class TransferDto {
  @IsUUID('4', { message: 'The id of destiny wallet must be a valid UUID' })
  @IsNotEmpty({ message: 'The destiny wallet is required' })
  receiverUserId: string;

  @IsString({ message: 'The currency must be a valid text' })
  @IsNotEmpty({ message: 'The currency is required' })
  currency: string

  @IsNumber({}, { message: 'The amount must be a valid number' })
  @Min(0.01, { message: 'The minimun amount to transfer is 0.01' })
  @IsNotEmpty({ message: 'the amount is required' })
  amount: number;

  @IsString({ message: 'The description must be a valid text' })
  description?: string;
}
