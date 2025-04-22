import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminGuard } from '../auth/admin.guard';
import { CreateOrderDto } from './dto/order.dto';

@Controller('admin/orders')
@UseGuards(AdminGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // Admin orders don't need to check for cart or user
    return this.ordersService.createAdminOrder(createOrderDto);
  }
} 