import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { SignupDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto'
import * as nodemailer from 'nodemailer'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  private mailTransporter: nodemailer.Transporter

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    // Initialize nodemailer transporter
    this.mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString()
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      await this.mailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Todo App - OTP Verification',
        html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 10 minutes.</p>`,
      })
    } catch (error) {
      console.error('Email send error:', error)
      throw new BadRequestException('Failed to send OTP email')
    }
  }

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findByEmail(signupDto.email)
    if (existingUser) {
      throw new ConflictException('Email already registered')
    }

    const user = await this.usersService.create(
      signupDto.email,
      signupDto.password,
      signupDto.name,
    )

    const otp = this.generateOtp()
    const otpHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await this.usersService.updateOtp(signupDto.email, otpHash, expiresAt)
    await this.sendOtpEmail(signupDto.email, otp)

    return {
      message: 'Signup successful. OTP sent to email.',
      email: user.email,
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(verifyOtpDto.email)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found for this user')
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired')
    }

    const isOtpValid = await bcrypt.compare(verifyOtpDto.otp, user.otpHash)
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP')
    }

    await this.usersService.verifyOtp(verifyOtpDto.email)
    return { message: 'Email verified successfully' }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified. Please verify your email first.')
    }

    const isPasswordValid = await this.usersService.verifyPassword(user, loginDto.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = this.jwtService.sign(
      { sub: user._id, email: user.email },
      { expiresIn: '15m' },
    )

    const refreshToken = this.jwtService.sign(
      { sub: user._id },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_TOKEN_SECRET },
    )

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email)
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, OTP will be sent' }
    }

    const otp = this.generateOtp()
    const otpHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await this.usersService.updateOtp(forgotPasswordDto.email, otpHash, expiresAt)
    await this.sendOtpEmail(forgotPasswordDto.email, otp)

    return { message: 'OTP sent to email' }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      throw new BadRequestException('No OTP found')
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired')
    }

    const isOtpValid = await bcrypt.compare(resetPasswordDto.otp, user.otpHash)
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP')
    }

    await this.usersService.updatePassword(resetPasswordDto.email, resetPasswordDto.newPassword)
    return { message: 'Password reset successful' }
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      })
      const accessToken = this.jwtService.sign(
        { sub: decoded.sub },
        { expiresIn: '15m' },
      )
      return { accessToken }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }
}
