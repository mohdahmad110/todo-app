import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
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
      throw new InternalServerErrorException('Failed to send OTP email. Please try again later.')
    }
  }

  async signup(signupDto: SignupDto) {
    try {
      // Validate email format (basic validation, main validation done in DTO)
      const emailLower = signupDto.email.toLowerCase()

      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(emailLower)
      if (existingUser) {
        throw new ConflictException('Email is already registered. Please login or use a different email.')
      }

      // Create new user
      const user = await this.usersService.create(emailLower, signupDto.password, signupDto.name?.trim())

      // Generate and send OTP
      const otp = this.generateOtp()
      const otpHash = await bcrypt.hash(otp, 10)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await this.usersService.updateOtp(emailLower, otpHash, expiresAt)
      await this.sendOtpEmail(emailLower, otp)

      return {
        message: 'Signup successful. OTP sent to your email.',
        email: user.email,
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error
      }
      console.error('Signup error:', error)
      throw new InternalServerErrorException('An error occurred during signup. Please try again.')
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      const emailLower = verifyOtpDto.email.toLowerCase()

      // Validate OTP format
      if (!/^[0-9]{6}$/.test(verifyOtpDto.otp)) {
        throw new BadRequestException('OTP must be a 6-digit number')
      }

      // Find user
      const user = await this.usersService.findByEmail(emailLower)
      if (!user) {
        throw new UnauthorizedException('User not found. Please signup first.')
      }

      // Check if OTP exists
      if (!user.otpHash || !user.otpExpiresAt) {
        throw new BadRequestException('No OTP found. Please request a new one.')
      }

      // Check if OTP expired
      if (new Date() > user.otpExpiresAt) {
        throw new BadRequestException('OTP has expired. Please request a new one.')
      }

      // Verify OTP
      const isOtpValid = await bcrypt.compare(verifyOtpDto.otp, user.otpHash)
      if (!isOtpValid) {
        throw new UnauthorizedException('Invalid OTP. Please check and try again.')
      }

      // Mark email as verified
      await this.usersService.verifyOtp(emailLower)
      return { message: 'Email verified successfully. You can now login.' }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }
      console.error('OTP verification error:', error)
      throw new InternalServerErrorException('An error occurred during OTP verification. Please try again.')
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const emailLower = loginDto.email.toLowerCase()

      // Find user
      const user = await this.usersService.findByEmail(emailLower)
      if (!user) {
        throw new UnauthorizedException('Invalid email or password.')
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Email not verified. Please verify your email first.')
      }

      // Verify password
      const isPasswordValid = await this.usersService.verifyPassword(user, loginDto.password)
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password.')
      }

      // Generate tokens
      const accessToken = this.jwtService.sign(
        { sub: user._id, email: user.email },
        { expiresIn: '15m' },
      )

      const refreshToken = this.jwtService.sign(
        { sub: user._id },
        { expiresIn: '7d', secret: process.env.JWT_REFRESH_TOKEN_SECRET },
      )

      return {
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      console.error('Login error:', error)
      throw new InternalServerErrorException('An error occurred during login. Please try again.')
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const emailLower = forgotPasswordDto.email.toLowerCase()

      const user = await this.usersService.findByEmail(emailLower)
      if (!user) {
        // Don't reveal if email exists for security
        return { message: 'If an account with this email exists, an OTP will be sent.' }
      }

      // Generate and send OTP
      const otp = this.generateOtp()
      const otpHash = await bcrypt.hash(otp, 10)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      await this.usersService.updateOtp(emailLower, otpHash, expiresAt)
      await this.sendOtpEmail(emailLower, otp)

      return { message: 'If an account with this email exists, an OTP will be sent.' }
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error
      }
      console.error('Forgot password error:', error)
      throw new InternalServerErrorException('An error occurred. Please try again.')
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Validate new password is different from OTP (common user mistake)
      if (resetPasswordDto.otp === resetPasswordDto.newPassword) {
        throw new BadRequestException('New password cannot be the same as OTP.')
      }

      const emailLower = resetPasswordDto.email.toLowerCase()

      // Find user
      const user = await this.usersService.findByEmail(emailLower)
      if (!user) {
        throw new UnauthorizedException('User not found.')
      }

      // Check if OTP exists
      if (!user.otpHash || !user.otpExpiresAt) {
        throw new BadRequestException('No OTP found. Please request password reset again.')
      }

      // Check if OTP expired
      if (new Date() > user.otpExpiresAt) {
        throw new BadRequestException('OTP has expired. Please request password reset again.')
      }

      // Verify OTP
      const isOtpValid = await bcrypt.compare(resetPasswordDto.otp, user.otpHash)
      if (!isOtpValid) {
        throw new UnauthorizedException('Invalid OTP.')
      }

      // Update password
      await this.usersService.updatePassword(emailLower, resetPasswordDto.newPassword)
      return { message: 'Password reset successful. You can now login with your new password.' }
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error
      }
      console.error('Reset password error:', error)
      throw new InternalServerErrorException('An error occurred during password reset. Please try again.')
    }
  }

  async refreshToken(token: string) {
    try {
      if (!token || token.trim().length === 0) {
        throw new BadRequestException('Refresh token is required.')
      }

      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      })

      const accessToken = this.jwtService.sign(
        { sub: decoded.sub },
        { expiresIn: '15m' },
      )

      return { accessToken }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired. Please login again.')
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token.')
      }
      if (error instanceof BadRequestException) {
        throw error
      }
      console.error('Refresh token error:', error)
      throw new UnauthorizedException('Invalid or expired refresh token. Please login again.')
    }
  }
}
