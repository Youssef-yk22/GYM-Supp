import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.adminService.login(username, password);
  }

  // Dashboard
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Product Management
  @Get('products')
  async getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Post('products')
  async createProduct(@Body() productData: any) {
    return this.adminService.createProduct(productData);
  }

  @Put('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() productData: any,
  ) {
    return this.adminService.updateProduct(id, productData);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // Order Management
  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.adminService.updateOrderStatus(id, status);
  }
} 