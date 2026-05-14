import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator'

export class CreateTodoDto {
  @IsNotEmpty()
  title: string

  @IsOptional()
  description?: string
}

export class UpdateTodoDto {
  @IsOptional()
  title?: string

  @IsOptional()
  description?: string

  @IsOptional()
  @IsBoolean()
  completed?: boolean
}
