import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  Matches,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Name of the group',
    example: 'Group 1',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Description of the group',
    example: 'Web Development Group 1',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Teacher ID that this group belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  teacher_id: string;

  @ApiProperty({
    description: 'Status of the group',
    enum: ['ACTIVE', 'INACTIVE', 'COMPLETED'],
    example: 'ACTIVE',
  })
  @IsString()
  @IsOptional()
  @Matches(/^(ACTIVE|INACTIVE|COMPLETED)$/)
  status: string;

  @ApiProperty({
    description: 'Course ID that this group belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;

  @ApiProperty({
    type: String,
    description: 'Start date of group',
    example: '2005-05-15',
  })
  @IsDateString()
  start_date: string | Date;
}
