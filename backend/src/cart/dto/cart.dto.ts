import { IsString, IsNumber, Min, IsNotEmpty, IsMongoId } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
} 