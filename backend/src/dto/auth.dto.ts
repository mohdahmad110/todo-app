import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator'

export class SignupDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsOptional()
  name?: string
}

export class LoginDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}

export class VerifyOtpDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  otp: string
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  otp: string

  @IsNotEmpty()
  @MinLength(6)
  newPassword: string
}
