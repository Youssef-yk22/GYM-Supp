import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument, CartItem } from '../schemas/cart.schema';
import { Product, ProductDocument } from '../schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

const MAX_CART_ITEMS = 20;
const MAX_ITEM_QUANTITY = 10;

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'items.productId',
        select: '_id name price image stock'
      });

    if (!cart) {
      const newCart = new this.cartModel({
        userId: new Types.ObjectId(userId),
        items: [],
        lastUpdated: new Date()
      });
      return newCart.save();
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartDocument> {
    const { productId, quantity } = addToCartDto;
    
    try {
      const userObjectId = new Types.ObjectId(userId);
      const productObjectId = new Types.ObjectId(productId);

      if (quantity > MAX_ITEM_QUANTITY) {
        throw new BadRequestException(`Maximum quantity per item is ${MAX_ITEM_QUANTITY}`);
      }

      // Verify product exists and has sufficient stock
      const product = await this.productModel.findById(productObjectId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      if (product.stock < quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      let cart = await this.cartModel.findOne({ userId: userObjectId });
      if (!cart) {
        cart = await this.cartModel.create({ 
          userId: userObjectId, 
          items: [], 
          lastUpdated: new Date() 
        });
      }

      // Check if cart has reached maximum items
      if (cart.items.length >= MAX_CART_ITEMS && !cart.items.some(item => item.productId.toString() === productId)) {
        throw new BadRequestException(`Maximum ${MAX_CART_ITEMS} items allowed in cart`);
      }

      // Check if product already in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > MAX_ITEM_QUANTITY) {
          throw new BadRequestException(`Maximum quantity per item is ${MAX_ITEM_QUANTITY}`);
        }
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({ 
          productId: productObjectId, 
          quantity 
        });
      }

      cart.lastUpdated = new Date();
      const savedCart = await cart.save();
      const populatedCart = await this.cartModel.findById(savedCart._id)
        .populate({
          path: 'items.productId',
          select: '_id name price image stock'
        });
      if (!populatedCart) {
        throw new NotFoundException('Cart not found after save');
      }
      return populatedCart;
    } catch (error) {
      if (error instanceof Error && error.name === 'BSONError') {
        throw new BadRequestException('Invalid product ID format');
      }
      throw error;
    }
  }

  async updateCartItem(
    userId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartDocument> {
    const { quantity } = updateCartItemDto;
    
    try {
      const userObjectId = new Types.ObjectId(userId);
      const productObjectId = new Types.ObjectId(productId);

      if (quantity > MAX_ITEM_QUANTITY) {
        throw new BadRequestException(`Maximum quantity per item is ${MAX_ITEM_QUANTITY}`);
      }

      // Verify product exists and has sufficient stock
      const product = await this.productModel.findById(productObjectId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      if (product.stock < quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      const cart = await this.cartModel.findOne({ userId: userObjectId });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );
      if (itemIndex === -1) {
        throw new NotFoundException('Item not found in cart');
      }

      cart.items[itemIndex].quantity = quantity;
      cart.lastUpdated = new Date();
      const savedCart = await cart.save();
      const populatedCart = await this.cartModel.findById(savedCart._id)
        .populate({
          path: 'items.productId',
          select: '_id name price image stock'
        });
      if (!populatedCart) {
        throw new NotFoundException('Cart not found after save');
      }
      return populatedCart;
    } catch (error) {
      if (error instanceof Error && error.name === 'BSONError') {
        throw new BadRequestException('Invalid product ID format');
      }
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<CartDocument> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const productObjectId = new Types.ObjectId(productId);

      const cart = await this.cartModel.findOne({ userId: userObjectId });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId,
      );
      cart.lastUpdated = new Date();
      const savedCart = await cart.save();
      const populatedCart = await this.cartModel.findById(savedCart._id)
        .populate({
          path: 'items.productId',
          select: '_id name price image stock'
        });
      if (!populatedCart) {
        throw new NotFoundException('Cart not found after save');
      }
      return populatedCart;
    } catch (error) {
      if (error instanceof Error && error.name === 'BSONError') {
        throw new BadRequestException('Invalid product ID format');
      }
      throw error;
    }
  }

  async clearCart(userId: string): Promise<CartDocument> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const cart = await this.cartModel.findOne({ userId: userObjectId });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      cart.items = [];
      cart.lastUpdated = new Date();
      const savedCart = await cart.save();
      const populatedCart = await this.cartModel.findById(savedCart._id)
        .populate({
          path: 'items.productId',
          select: '_id name price image stock'
        });
      if (!populatedCart) {
        throw new NotFoundException('Cart not found after save');
      }
      return populatedCart;
    } catch (error) {
      if (error instanceof Error && error.name === 'BSONError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw error;
    }
  }

  async getCartTotal(userId: string): Promise<number> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const cart = await this.cartModel
        .findOne({ userId: userObjectId })
        .populate('items.productId');
      if (!cart) {
        return 0;
      }

      const validatedCart = await this.validateCartPrices(cart);
      return validatedCart.items.reduce((total, item) => {
        const product = item.productId as unknown as ProductDocument;
        return total + product.price * item.quantity;
      }, 0);
    } catch (error) {
      if (error instanceof Error && error.name === 'BSONError') {
        throw new BadRequestException('Invalid user ID format');
      }
      throw error;
    }
  }

  private async validateCartPrices(cart: CartDocument): Promise<CartDocument> {
    let needsUpdate = false;
    const currentDate = new Date();
    const oneHourAgo = new Date(currentDate.getTime() - 60 * 60 * 1000);

    // Check if cart needs price validation
    if (!cart.lastUpdated || cart.lastUpdated < oneHourAgo) {
      for (const item of cart.items) {
        const product = await this.productModel.findById(item.productId);
        if (product) {
          const populatedProduct = item.productId as unknown as ProductDocument;
          if (product.price !== populatedProduct.price) {
            needsUpdate = true;
            break;
          }
        }
      }
    }

    if (needsUpdate) {
      cart.lastUpdated = currentDate;
      await cart.save();
    }

    return cart;
  }

  async getCartWithProducts(userId: string) {
    return this.cartModel
      .findOne({ userId })
      .populate('items.productId', 'name price image')
      .exec();
  }
} 