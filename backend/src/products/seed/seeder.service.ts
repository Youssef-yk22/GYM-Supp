import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { seedProducts } from './products.seed';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async seed() {
    const count = await this.productModel.countDocuments();
    if (count === 0) {
      await this.productModel.insertMany(seedProducts);
      console.log('Products seeded successfully');
    } else {
      console.log('Products already exist in the database');
    }
  }
} 