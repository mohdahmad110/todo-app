import { Controller, Post, Body, HttpCode, BadRequestException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignupDto, LoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    try {
      return await this.authService.signup(signupDto)
    } catch (error) {
      throw error
    }
  }

  @Post('verify-otp')
  @HttpCode(200)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtp(verifyOtpDto)
    } catch (error) {
      throw error
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto)
    } catch (error) {
      throw error
    }
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(forgotPasswordDto)
    } catch (error) {
      throw error
    }
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(resetPasswordDto)
    } catch (error) {
      throw error
    }
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() body: { refreshToken?: string }) {
    try {
      if (!body.refreshToken) {
        throw new BadRequestException('Refresh token is required')
      }
      return await this.authService.refreshToken(body.refreshToken)
    } catch (error) {
      throw error
    }
  }
}
