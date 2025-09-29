import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, MenuItem, User])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}