import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request.interface';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: RequestWithUser) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post()
  addToCart(
    @Req() req: RequestWithUser,
    @Body(new ValidationPipe()) addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(req.user.sub, addToCartDto);
  }

  @Put(':productId')
  updateCartItem(
    @Req() req: RequestWithUser,
    @Param('productId') productId: string,
    @Body(new ValidationPipe()) updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.sub,
      productId,
      updateCartItemDto,
    );
  }

  @Delete(':productId')
  removeFromCart(
    @Req() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(req.user.sub, productId);
  }

  @Delete()
  clearCart(@Req() req: RequestWithUser) {
    return this.cartService.clearCart(req.user.sub);
  }

  @Get('total')
  getCartTotal(@Req() req: RequestWithUser) {
    return this.cartService.getCartTotal(req.user.sub);
  }
} 