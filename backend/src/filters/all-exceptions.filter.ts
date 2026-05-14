import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: number
    let message: string
    let errorResponse: any

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      errorResponse = exception.getResponse()

      if (typeof errorResponse === 'string') {
        message = errorResponse
      } else if (typeof errorResponse === 'object' && 'message' in errorResponse) {
        message = Array.isArray(errorResponse.message)
          ? errorResponse.message.join(', ')
          : errorResponse.message
      } else {
        message = 'An error occurred'
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = exception.message || 'Internal server error'
      this.logger.error(`Error: ${exception.message}`, exception.stack)
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Internal server error'
      this.logger.error('Unknown error:', exception)
    }

    const responseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    }

    response.status(status).json(responseBody)
  }
}
