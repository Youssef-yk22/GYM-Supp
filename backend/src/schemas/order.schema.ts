import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop([{
    productId: { type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String }
  }])
  items: Array<{
    productId: any;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
    required: true
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  @Prop({ required: true, default: 'pending' })
  status: string;

  @Prop({ required: true, default: 'credit_card' })
  paymentMethod: string;

  @Prop({ required: true })
  total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 