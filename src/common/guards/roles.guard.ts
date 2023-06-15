import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserRoles } from '../enums';

export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<EUserRoles[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !this.matchRoles(roles, user.role)) {
      throw new ForbiddenException(
        'User has not permissions to perform this action',
      );
    } else return true;
  }

  private matchRoles(roles: EUserRoles[], userRole: EUserRoles): boolean {
    return roles.includes(userRole);
  }
}
