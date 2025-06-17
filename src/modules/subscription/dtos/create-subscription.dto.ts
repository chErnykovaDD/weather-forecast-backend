import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from '@nestjs/class-validator';
import { Frequency } from '../enum/frequency.enum';

export class CreateSubscriptionDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsEnum(Frequency)
  frequency: Frequency;
}
