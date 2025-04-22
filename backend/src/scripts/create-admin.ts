import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get(getModelToken(User.name));
  
  // Check if admin already exists
  const existingAdmin = await userModel.findOne({ email: 'admin@example.com' });
  if (existingAdmin) {
    console.log('Admin account already exists');
    await app.close();
    return;
  }

  // Create admin account
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await userModel.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });

  console.log('Admin account created successfully');
  await app.close();
}

bootstrap(); 