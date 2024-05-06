import { HttpException, HttpStatus } from '@nestjs/common';

export class MyCustomException extends HttpException {
  constructor(message: string) {
    super({ message, statusCode: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST);
  }
}

// throw new MyCustomException('This is a custom exception message.');