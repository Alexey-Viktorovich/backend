import { ConflictException } from '@nestjs/common';

export class RemoveItSelfError extends ConflictException {
  constructor() {
    super("You can't delete yourself");
  }
}
