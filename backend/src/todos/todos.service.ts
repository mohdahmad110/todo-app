import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Todo, TodoDocument } from '../schemas/todo.schema'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    const todo = new this.todoModel({
      userId: new Types.ObjectId(userId),
      ...createTodoDto,
    })
    return todo.save()
  }

  async findAll(userId: string) {
    return this.todoModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 })
  }

  async findById(id: string, userId: string) {
    const todo = await this.todoModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    })
    if (!todo) {
      throw new NotFoundException('Todo not found')
    }
    return todo
  }

  async update(id: string, userId: string, updateTodoDto: UpdateTodoDto) {
    const todo = await this.todoModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      },
      updateTodoDto,
      { new: true },
    )
    if (!todo) {
      throw new NotFoundException('Todo not found')
    }
    return todo
  }

  async delete(id: string, userId: string) {
    const todo = await this.todoModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    })
    if (!todo) {
      throw new NotFoundException('Todo not found')
    }
    return { message: 'Todo deleted successfully' }
  }
}
