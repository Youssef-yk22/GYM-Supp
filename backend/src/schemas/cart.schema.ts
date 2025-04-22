import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

export interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
  price?: number;
  addedAt?: Date;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    type: [{
      productId: { type: Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number },
      addedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  items: CartItem[];

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;

  @Prop({ type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ type: Date })
  lockedUntil: Date;
}

export type CartDocument = Cart & Document;
export const CartSchema = SchemaFactory.createForClass(Cart);

// Add indexes for better query performance
CartSchema.index({ userId: 1 });
CartSchema.index({ 'items.productId': 1 }); 