import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PasswordResetDocument = PasswordReset & Document;

@Schema()
export class PasswordReset {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiry: Date;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset); 