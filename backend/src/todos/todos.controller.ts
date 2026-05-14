import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common'
import { TodosService } from './todos.service'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Types } from 'mongoose'

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  private validateMongoId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid todo ID format')
    }
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @Request() req: any) {
    try {
      return await this.todosService.create(req.user.userId, createTodoDto)
    } catch (error) {
      throw error
    }
  }

  @Get()
  async findAll(@Request() req: any) {
    try {
      return await this.todosService.findAll(req.user.userId)
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    try {
      this.validateMongoId(id)
      return await this.todosService.findById(id, req.user.userId)
    } catch (error) {
      throw error
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req: any,
  ) {
    try {
      this.validateMongoId(id)
      if (Object.keys(updateTodoDto).length === 0) {
        throw new BadRequestException('At least one field must be provided for update')
      }
      return await this.todosService.update(id, req.user.userId, updateTodoDto)
    } catch (error) {
      throw error
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    try {
      this.validateMongoId(id)
      return await this.todosService.delete(id, req.user.userId)
    } catch (error) {
      throw error
    }
  }
}
