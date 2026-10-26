import { HttpException, HttpStatus } from '@nestjs/common';

/** 404 when a singleton row is missing. T10 wraps this in the shared error body. */
export class NotSeededException extends HttpException {
  constructor(entity: string) {
    super(
      { code: 'NOT_SEEDED', message: `${entity} is missing. Run the seed.` },
      HttpStatus.NOT_FOUND,
    );
  }
}
