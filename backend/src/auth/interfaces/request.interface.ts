import { Request } from 'express';
import { User } from '../../schemas/user.schema';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
} 