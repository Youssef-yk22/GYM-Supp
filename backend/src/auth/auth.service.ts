import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string): Promise<{ token: string }> {
    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    // Generate JWT
    const token = this.generateToken(user);

    return { token };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const token = this.generateToken(user);

    return { token };
  }

  async getProfile(userId: string): Promise<{
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    profilePicture?: string;
    isActive: boolean;
    lastLogin?: Date;
  }> {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      // Update last login
      await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() });
      
      return {
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(
    userId: string,
    updateData: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      address?: string;
    }
  ): Promise<{
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    profilePicture?: string;
    isActive: boolean;
    lastLogin?: Date;
  }> {
    try {
      // Check if user exists
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If email is being updated, check if it's already taken
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.userModel.findOne({ email: updateData.email });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
      }

      // Update user
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        throw new Error('Failed to update profile');
      }

      return {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture,
        isActive: updatedUser.isActive,
        lastLogin: updatedUser.lastLogin,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to update profile');
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userModel.findByIdAndDelete(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Failed to delete profile');
    }
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
} 