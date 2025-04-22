import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  FilterOrdersDto,
} from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RequestWithUser } from '../auth/interfaces/request.interface';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  async create(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto, req.user.sub);
  }

  @Get('history')
  async getOrderHistory(@Req() req: RequestWithUser) {
    return this.ordersService.getOrderHistory(req.user.sub);
  }

  @Get('stats')
  async getOrderStats(@Req() req: RequestWithUser) {
    return this.ordersService.getOrderStats(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, req.user.id, status);
  }

  @Post()
  async createOrder(@Req() req: RequestWithUser, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto, req.user.sub);
  }

  @Post('admin')
  @UseGuards(AdminGuard)
  async createAdminOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createAdminOrder(createOrderDto);
  }

  @Get('history/:userId')
  async findUserOrders(@Param('userId') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }
} 