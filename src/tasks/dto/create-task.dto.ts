import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @MinLength(3)
  title: string;
  @IsString()
  @IsOptional()
  description?: string;
}
