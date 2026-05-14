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
} from '@nestjs/common'
import { TodosService } from './todos.service'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @Request() req: any) {
    return this.todosService.create(req.user.userId, createTodoDto)
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.todosService.findAll(req.user.userId)
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    return this.todosService.findById(id, req.user.userId)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req: any,
  ) {
    return this.todosService.update(id, req.user.userId, updateTodoDto)
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.todosService.delete(id, req.user.userId)
  }
}
