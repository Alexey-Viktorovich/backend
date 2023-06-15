import { EUserRoles } from 'src/common/enums';
import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards';
import { Reflector } from '@nestjs/core';

export function Roles(...roles: EUserRoles[]): any {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(new RolesGuard(new Reflector())),
  );
}
