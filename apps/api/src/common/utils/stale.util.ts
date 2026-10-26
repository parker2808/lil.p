import { ConflictException } from '@nestjs/common';

export function assertFresh(current: Date, incoming?: string): void {
  if (incoming && current.getTime() !== new Date(incoming).getTime()) {
    throw new ConflictException({
      code: 'STALE',
      message: 'This record was saved by someone else',
    });
  }
}
