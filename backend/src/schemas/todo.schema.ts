import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TodoDocument = Todo & Document

@Schema({ timestamps: true })
export class Todo {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ nullable: true })
  description?: string

  @Prop({ default: false })
  completed: boolean
}

export const TodoSchema = SchemaFactory.createForClass(Todo)
