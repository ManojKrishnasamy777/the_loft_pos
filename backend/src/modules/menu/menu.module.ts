import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuItem } from '../../entities/menu-item.entity';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, Category])],
  providers: [MenuService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}