import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { Product } from '../schemas/product.schema';
import { CreateOrderDto, OrderStatus, FilterOrdersDto } from './dto/order.dto';
import { CartService } from '../cart/cart.service';

interface ProductDocument {
  _id: Types.ObjectId;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface PopulatedOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  product: ProductDocument;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const items = createOrderDto.items as NonNullable<typeof createOrderDto.items>;
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = new this.orderModel({
      ...createOrderDto,
      userId,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return order.save();
  }

  async findAll(userId: string, filterDto?: FilterOrdersDto) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (filterDto?.status) {
      query.status = filterDto.status;
    }

    const orders = await this.orderModel
      .find(query)
      .populate<{ items: PopulatedOrderItem[] }>('items.productId', 'name price image')
      .sort({ createdAt: -1 });

    return orders.map(order => ({
      ...order.toObject(),
      items: order.items.map(item => ({
        product: {
          _id: item.productId,
          name: (item.product as unknown as ProductDocument).name,
          price: (item.product as unknown as ProductDocument).price,
          image: (item.product as unknown as ProductDocument).image
        },
        quantity: item.quantity,
        price: item.price
      }))
    }));
  }

  async findOne(id: string) {
    return this.orderModel.findById(id).exec();
  }

  async updateStatus(id: string, userId: string, status: string) {
    const order = await this.orderModel.findOne({ _id: id, userId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = status;
    return order.save();
  }

  async getOrderStats(userId: string) {
    const orders = await this.orderModel.find({ userId: new Types.ObjectId(userId) });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    return {
      totalOrders,
      totalSpent,
      statusCounts
    };
  }

  async getOrderHistory(userId: string) {
    try {
      const orders = await this.orderModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate<{ items: PopulatedOrderItem[] }>('items.productId', 'name price image')
        .sort({ createdAt: -1 });

      return orders.map(order => {
        const orderObj = order.toObject();
        return {
          ...orderObj,
          items: orderObj.items.map(item => {
            // Type assertion for the populated product
            const product = item.productId as unknown as ProductDocument;
            
            return {
              product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image
              },
              quantity: item.quantity,
              price: item.price
            };
          })
        };
      });
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  async createAdminOrder(createOrderDto: CreateOrderDto) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const items = createOrderDto.items as NonNullable<typeof createOrderDto.items>;
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = new this.orderModel({
      ...createOrderDto,
      total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return order.save();
  }

  async findUserOrders(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
} 