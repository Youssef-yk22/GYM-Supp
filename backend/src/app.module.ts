import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { AdminModule } from './admin/admin.module';
import configuration from './config/configuration';
import { User, UserSchema } from './schemas/user.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { PasswordReset, PasswordResetSchema } from './schemas/password-reset.schema';
import { OrdersModule } from './orders/orders.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('database.uri');
        console.log('Attempting to connect to MongoDB at:', uri);
        return {
          uri,
          directConnection: true,
          serverSelectionTimeoutMS: 5000,
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              console.log('MongoDB connection established successfully');
            });
            connection.on('error', (error) => {
              console.error('MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
              console.log('MongoDB disconnected');
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
    ]),
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
