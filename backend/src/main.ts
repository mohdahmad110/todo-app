import { NestFactory } from '@nestjs/core'
import { ValidationPipe, BadRequestException } from '@nestjs/common'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './filters/all-exceptions.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  
  // Enable CORS
  const allowedOrigins = [
    'http://localhost:3000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ]

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })
  
  // Global validation pipe with error formatting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const errorMessages = errors.map((error) => {
          const constraints = error.constraints || {}
          return `${error.property}: ${Object.values(constraints).join(', ')}`
        })
        return new BadRequestException({
          message: 'Validation failed',
          errors: errorMessages,
        })
      },
    }),
  )

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter())
  
  await app.listen(process.env.PORT ?? 3001)
  console.log(`Backend running on ${process.env.PORT ?? 3001}`)
}
bootstrap()
