import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Product } from '../schemas/product.schema';
import { Order } from '../schemas/order.schema';
import { Cart } from '../schemas/cart.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ email: username, role: 'admin' });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      admin: {
        _id: user._id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
      token: this.jwtService.sign(payload),
    };
  }

  // User Management
  async getAllUsers() {
    return this.userModel.find().select('-password').exec();
  }

  async getUserById(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return this.userModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password').exec();
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isActive: true,
    });
    return user.save();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true },
    ).select('-password');
  }

  async deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  // Product Management
  async getAllProducts() {
    return this.productModel.find().exec();
  }

  async createProduct(productData: any) {
    const product = new this.productModel(productData);
    return product.save();
  }

  async updateProduct(id: string, productData: any) {
    return this.productModel.findByIdAndUpdate(
      id,
      productData,
      { new: true }
    ).exec();
  }

  async deleteProduct(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  // Order Management
  async getAllOrders() {
    return this.orderModel
      .find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')
      .exec();
  }

  async getOrderById(id: string) {
    return this.orderModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price')
      .exec();
  }

  async updateOrderStatus(id: string, status: string) {
    return this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).exec();
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.productModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      this.orderModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .exec(),
      this.productModel
        .find()
        .sort({ stock: -1 })
        .limit(5)
        .exec()
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      topProducts
    };
  }
} 