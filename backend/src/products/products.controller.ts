import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ReviewProductDto,
  ProductFilterDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { SerializedProduct } from './types/product.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Public()
  async findAll(@Query() filterDto: ProductFilterDto) {
    const products = await this.productsService.findAll(filterDto);
    return {
      products,
      total: products.length
    };
  }

  @Get('featured')
  @Public()
  getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  @Get('search')
  @Public()
  async searchProducts(@Query('query') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.productsService.searchProducts(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/related')
  @Public()
  getRelatedProducts(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async addReview(
    @Param('id') id: string,
    @Body() reviewDto: ReviewProductDto,
    @Req() req: any,
  ) {
    return this.productsService.addReview(id, req.user.id, reviewDto);
  }

  @Put(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }
} 