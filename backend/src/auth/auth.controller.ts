import { Controller, Post, Body, ValidationPipe, Get, UseGuards, Req, BadRequestException, NotFoundException, InternalServerErrorException, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(name, email, password);
  }

  @Public()
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: RequestWithUser) {
    try {
      const userId = req.user.sub;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.authService.getProfile(userId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateData: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      address?: string;
    }
  ) {
    try {
      const userId = req.user.sub;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.authService.updateProfile(userId, updateData);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  async deleteProfile(@Req() req: RequestWithUser) {
    try {
      const userId = req.user.sub;
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      await this.authService.deleteProfile(userId);
      return { message: 'Profile deleted successfully' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete profile');
    }
  }
} 