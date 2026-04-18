import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  password!: string;
}
