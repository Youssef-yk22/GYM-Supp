export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; 