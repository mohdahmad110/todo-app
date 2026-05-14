import { IsEmail, IsNotEmpty, MinLength, IsOptional, MaxLength, Matches, IsString } from 'class-validator'

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  newPassword: string
}
