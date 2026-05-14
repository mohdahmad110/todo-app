import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // Frontend URL
    credentials: true,
  })
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe())
  
  await app.listen(process.env.PORT ?? 3001)
  console.log(`Backend running on ${process.env.PORT ?? 3001}`)
}
bootstrap()
