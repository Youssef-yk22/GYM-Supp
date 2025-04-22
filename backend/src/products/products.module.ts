import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { SeederService } from './seed/seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    SeederService,
  ],
  exports: [ProductsService],
})
export class ProductsModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    await this.seederService.seed();
  }
} 