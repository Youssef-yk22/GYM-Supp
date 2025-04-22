import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { SerializedProduct } from './types/product.types';
import {
  CreateProductDto,
  UpdateProductDto,
  ReviewProductDto,
  ProductFilterDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private serializeProduct(product: ProductDocument): SerializedProduct {
    const doc = product as unknown as Product & Document & { _id: string; createdAt: Date; updatedAt: Date };
    return {
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      price: doc.price,
      category: doc.category,
      stock: doc.stock,
      images: doc.images || [],
      rating: doc.rating || 0,
      numReviews: doc.numReviews || 0,
      reviews: doc.reviews || [],
      featured: doc.featured || false,
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  async create(createProductDto: CreateProductDto): Promise<SerializedProduct> {
    const createdProduct = new this.productModel(createProductDto);
    const savedProduct = await createdProduct.save();
    return this.serializeProduct(savedProduct);
  }

  async findAll(filterDto: ProductFilterDto): Promise<SerializedProduct[]> {
    console.log('Filter DTO:', filterDto);
    const { category, search, minPrice, maxPrice, sortBy, order } = filterDto;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    console.log('MongoDB Query:', query);
    const products = await this.productModel.find(query).sort(sortOptions).exec();
    console.log('Found products:', products.length);
    return products.map(product => this.serializeProduct(product));
  }

  async findOne(id: string): Promise<SerializedProduct> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.serializeProduct(product);
  }

  async findBySlug(slug: string): Promise<SerializedProduct> {
    const product = await this.productModel.findOne({ slug }).exec();
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return this.serializeProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<SerializedProduct> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    ).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.serializeProduct(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async addReview(id: string, userId: string, reviewDto: ReviewProductDto): Promise<SerializedProduct> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const existingReview = product.reviews.find(review => review.userId === userId);
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    product.reviews.push({
      userId,
      rating: reviewDto.rating,
      comment: reviewDto.comment,
      date: new Date(),
    });

    // Update rating and numReviews
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.numReviews;

    const updatedProduct = await product.save();
    return this.serializeProduct(updatedProduct);
  }

  async updateStock(id: string, quantity: number): Promise<SerializedProduct> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (product.stock + quantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    product.stock += quantity;
    const updatedProduct = await product.save();
    return this.serializeProduct(updatedProduct);
  }

  async getFeaturedProducts(): Promise<SerializedProduct[]> {
    const products = await this.productModel.find({ featured: true }).limit(10).exec();
    return products.map(product => this.serializeProduct(product));
  }

  async getRelatedProducts(id: string): Promise<SerializedProduct[]> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const relatedProducts = await this.productModel.find({
      category: product.category,
      _id: { $ne: id },
    }).limit(4).exec();
    
    return relatedProducts.map(product => this.serializeProduct(product));
  }

  async searchProducts(query: string): Promise<SerializedProduct[]> {
    const products = await this.productModel.find({
      $text: { $search: query },
    }, {
      score: { $meta: 'textScore' },
    }).sort({
      score: { $meta: 'textScore' },
    }).exec();
    
    return products.map(product => this.serializeProduct(product));
  }
} 