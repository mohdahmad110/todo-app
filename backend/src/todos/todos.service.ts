import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Todo, TodoDocument } from '../schemas/todo.schema'
import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto'

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<TodoDocument>) {}

  private validateObjectId(id: string): Types.ObjectId {
    try {
      return new Types.ObjectId(id)
    } catch (error) {
      throw new BadRequestException('Invalid todo ID format')
    }
  }

  async create(userId: string, createTodoDto: CreateTodoDto) {
    try {
      const userObjectId = this.validateObjectId(userId)
      
      // Trim and validate title
      const trimmedTitle = createTodoDto.title?.trim()
      if (!trimmedTitle || trimmedTitle.length === 0) {
        throw new BadRequestException('Title cannot be empty')
      }

      const todo = new this.todoModel({
        userId: userObjectId,
        title: trimmedTitle,
        description: createTodoDto.description?.trim() || '',
      })
      return await todo.save()
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error('Todo creation error:', error)
      throw new InternalServerErrorException('Failed to create todo. Please try again.')
    }
  }

  async findAll(userId: string) {
    try {
      const userObjectId = this.validateObjectId(userId)
      return await this.todoModel.find({ userId: userObjectId }).sort({ createdAt: -1 })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error('Find all todos error:', error)
      throw new InternalServerErrorException('Failed to fetch todos. Please try again.')
    }
  }

  async findById(id: string, userId: string) {
    try {
      const todoId = this.validateObjectId(id)
      const userObjectId = this.validateObjectId(userId)

      const todo = await this.todoModel.findOne({
        _id: todoId,
        userId: userObjectId,
      })

      if (!todo) {
        throw new NotFoundException('Todo not found or you do not have permission to access it')
      }
      return todo
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      console.error('Find todo by ID error:', error)
      throw new InternalServerErrorException('Failed to fetch todo. Please try again.')
    }
  }

  async update(id: string, userId: string, updateTodoDto: UpdateTodoDto) {
    try {
      const todoId = this.validateObjectId(id)
      const userObjectId = this.validateObjectId(userId)

      // Validate and trim update data
      const updateData: any = {}
      if (updateTodoDto.title !== undefined) {
        const trimmedTitle = updateTodoDto.title.trim()
        if (trimmedTitle.length === 0) {
          throw new BadRequestException('Title cannot be empty')
        }
        updateData.title = trimmedTitle
      }
      if (updateTodoDto.description !== undefined) {
        updateData.description = updateTodoDto.description.trim()
      }
      if (updateTodoDto.completed !== undefined) {
        updateData.completed = updateTodoDto.completed
      }

      const todo = await this.todoModel.findOneAndUpdate(
        {
          _id: todoId,
          userId: userObjectId,
        },
        updateData,
        { new: true },
      )

      if (!todo) {
        throw new NotFoundException('Todo not found or you do not have permission to update it')
      }
      return todo
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      console.error('Todo update error:', error)
      throw new InternalServerErrorException('Failed to update todo. Please try again.')
    }
  }

  async delete(id: string, userId: string) {
    try {
      const todoId = this.validateObjectId(id)
      const userObjectId = this.validateObjectId(userId)

      const todo = await this.todoModel.findOneAndDelete({
        _id: todoId,
        userId: userObjectId,
      })

      if (!todo) {
        throw new NotFoundException('Todo not found or you do not have permission to delete it')
      }
      return { message: 'Todo deleted successfully' }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error
      }
      console.error('Todo deletion error:', error)
      throw new InternalServerErrorException('Failed to delete todo. Please try again.')
    }
  }
}
