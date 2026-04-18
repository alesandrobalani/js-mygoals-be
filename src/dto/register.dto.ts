import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @MinLength(8)
  password!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;
}
