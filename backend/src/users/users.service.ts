import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../schemas/user.schema'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new this.userModel({
      email,
      passwordHash: hashedPassword,
      name,
      isEmailVerified: false,
    })
    return user.save()
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email })
  }

  async findById(id: string) {
    return this.userModel.findById(id)
  }

  async updateOtp(email: string, otpHash: string, expiresAt: Date) {
    return this.userModel.findOneAndUpdate(
      { email },
      { otpHash, otpExpiresAt: expiresAt },
      { new: true }
    )
  }

  async verifyOtp(email: string) {
    return this.userModel.findOneAndUpdate(
      { email },
      { isEmailVerified: true, otpHash: null, otpExpiresAt: null },
      { new: true }
    )
  }

  async updatePassword(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return this.userModel.findOneAndUpdate(
      { email },
      { passwordHash: hashedPassword, otpHash: null, otpExpiresAt: null },
      { new: true }
    )
  }

  async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash)
  }
}
