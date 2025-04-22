import { IsString, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, IsNotEmpty, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

export class CreateOrderDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  items?: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

export class FilterOrdersDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
} 