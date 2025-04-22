import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from '../schemas/cart.schema';
import { Product, ProductSchema } from '../schemas/product.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [
    CartService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [CartService],
})
export class CartModule {} 