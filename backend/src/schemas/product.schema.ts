import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as slug from 'mongoose-slug-generator';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop([String])
  images: string[];

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;

  @Prop([{
    userId: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }])
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    date: Date;
  }>;

  @Prop({ default: false })
  featured: boolean;

  @Prop([String])
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.plugin(slug);

// Add indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 }); 