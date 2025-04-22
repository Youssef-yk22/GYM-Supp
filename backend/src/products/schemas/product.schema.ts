import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ required: true })
  category: string;

  @Prop([String])
  images: string[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ type: [{ userId: String, rating: Number, comment: String, date: Date }] })
  reviews: Array<{ userId: string; rating: number; comment: string; date: Date }>;

  @Prop({ default: 0 })
  discount: number;

  @Prop()
  brand: string;

  @Prop([String])
  tags: string[];

  @Prop({ type: Object })
  nutritionInfo: {
    servingSize: string;
    servingsPerContainer: number;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    [key: string]: any;
  };

  @Prop({ type: Object })
  specifications: {
    weight: string;
    dimensions: string;
    flavor: string;
    [key: string]: any;
  };
}

export const ProductSchema = SchemaFactory.createForClass(Product); 