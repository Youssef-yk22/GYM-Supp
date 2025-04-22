import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, ValidateNested, Min, IsObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class NutritionInfoDto {
  @IsString()
  servingSize: string;

  @IsNumber()
  @Min(0)
  servingsPerContainer: number;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbohydrates: number;

  @IsNumber()
  @Min(0)
  fat: number;
}

class SpecificationsDto {
  @IsString()
  weight: string;

  @IsString()
  dimensions: string;

  @IsString()
  flavor: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => NutritionInfoDto)
  @IsOptional()
  nutritionInfo?: NutritionInfoDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SpecificationsDto)
  @IsOptional()
  specifications?: SpecificationsDto;
}

export class UpdateProductDto extends CreateProductDto {
  @IsOptional()
  declare name: string;

  @IsOptional()
  declare description: string;

  @IsOptional()
  declare price: number;

  @IsOptional()
  declare stock: number;

  @IsOptional()
  declare category: string;
}

export class FilterProductsDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

export class ReviewProductDto {
  @IsNumber()
  @Min(1)
  rating: number;

  @IsString()
  comment: string;
}

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'rating' | 'newest';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
} 