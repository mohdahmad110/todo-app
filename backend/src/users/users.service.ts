import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../schemas/user.schema'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string, name?: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = new this.userModel({
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        name: name?.trim() || null,
        isEmailVerified: false,
      })
      return await user.save()
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error
        throw new ConflictException('Email is already registered.')
      }
      console.error('User creation error:', error)
      throw new InternalServerErrorException('Failed to create user. Please try again.')
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userModel.findOne({ email: email.toLowerCase() })
    } catch (error) {
      console.error('Find user error:', error)
      throw new InternalServerErrorException('Failed to find user. Please try again.')
    }
  }

  async findById(id: string) {
    try {
      return await this.userModel.findById(id)
    } catch (error) {
      console.error('Find user by ID error:', error)
      throw new InternalServerErrorException('Failed to find user. Please try again.')
    }
  }

  async updateOtp(email: string, otpHash: string, expiresAt: Date) {
    try {
      return await this.userModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        { otpHash, otpExpiresAt: expiresAt },
        { returnDocument: 'after' }
      )
    } catch (error) {
      console.error('Update OTP error:', error)
      throw new InternalServerErrorException('Failed to update OTP. Please try again.')
    }
  }

  async verifyOtp(email: string) {
    try {
      return await this.userModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        { isEmailVerified: true, otpHash: null, otpExpiresAt: null },
        { returnDocument: 'after' }
      )
    } catch (error) {
      console.error('Verify OTP error:', error)
      throw new InternalServerErrorException('Failed to verify email. Please try again.')
    }
  }

  async updatePassword(email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      return await this.userModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        { passwordHash: hashedPassword, otpHash: null, otpExpiresAt: null },
        { returnDocument: 'after' }
      )
    } catch (error) {
      console.error('Update password error:', error)
      throw new InternalServerErrorException('Failed to update password. Please try again.')
    }
  }

  async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.passwordHash)
    } catch (error) {
      console.error('Password verification error:', error)
      throw new InternalServerErrorException('Failed to verify password. Please try again.')
    }
  }
}
