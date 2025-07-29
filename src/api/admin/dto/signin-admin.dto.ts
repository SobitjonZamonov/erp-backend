import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class SignInAdminDto {
  @ApiProperty({
    type: String,
    description: 'Username of admin',
    example: 'jhondoe007',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password of admin',
    example: 'jhondoe007!A',
  })
  @IsNotEmpty()
  password: string;
}
