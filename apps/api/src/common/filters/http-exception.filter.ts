import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

type HttpRequest = { url: string; method: string };
type HttpResponse = {
  status: (code: number) => HttpResponse;
  json: (body: unknown) => void;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponse>();
    const request = ctx.getRequest<HttpRequest>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? (exception.getStatus() as HttpStatus)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responsePayload: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const messageValue =
      typeof responsePayload === 'object' &&
      responsePayload !== null &&
      'message' in responsePayload
        ? (responsePayload as { message?: unknown }).message
        : responsePayload;

    const messageText = Array.isArray(messageValue)
      ? messageValue.map((v) => String(v)).join(', ')
      : typeof messageValue === 'string'
        ? messageValue
        : typeof responsePayload === 'string'
          ? responsePayload
          : 'Internal server error';

    const errorValue =
      typeof responsePayload === 'object' &&
      responsePayload !== null &&
      'error' in responsePayload
        ? (responsePayload as { error?: unknown }).error
        : null;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: messageText,
      error: typeof errorValue === 'string' ? errorValue : null,
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Method: ${request.method} Path: ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `Method: ${request.method} Path: ${request.url} Status: ${status} Message: ${JSON.stringify(responsePayload)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
