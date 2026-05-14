import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ default: false })
  isEmailVerified: boolean

  @Prop({ nullable: true })
  otpHash?: string

  @Prop({ nullable: true })
  otpExpiresAt?: Date

  @Prop({ nullable: true })
  name?: string
}

export const UserSchema = SchemaFactory.createForClass(User)
