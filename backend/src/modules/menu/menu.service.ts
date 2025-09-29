import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { Category } from '../../entities/category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // Menu Items
  async findAllMenuItems(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActiveMenuItems(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { isActive: true },
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findMenuItemById(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItem;
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const category = await this.categoryRepository.findOne({
      where: { id: createMenuItemDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const menuItem = this.menuItemRepository.create(createMenuItemDto);
    const savedMenuItem = await this.menuItemRepository.save(menuItem);
    return this.findMenuItemById(savedMenuItem.id);
  }

  async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.findMenuItemById(id);

    if (updateMenuItemDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateMenuItemDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    await this.menuItemRepository.update(id, updateMenuItemDto);
    return this.findMenuItemById(id);
  }

  async removeMenuItem(id: string): Promise<void> {
    const menuItem = await this.findMenuItemById(id);
    await this.menuItemRepository.remove(menuItem);
  }

  async toggleMenuItemStatus(id: string): Promise<MenuItem> {
    const menuItem = await this.findMenuItemById(id);
    await this.menuItemRepository.update(id, { isActive: !menuItem.isActive });
    return this.findMenuItemById(id);
  }

  // Categories
  async findAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findActiveCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['menuItems'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findCategoryById(id);
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findCategoryById(id);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    
    // Check if category has menu items
    const menuItemsCount = await this.menuItemRepository.count({
      where: { categoryId: id },
    });

    if (menuItemsCount > 0) {
      throw new Error('Cannot delete category with existing menu items');
    }

    await this.categoryRepository.remove(category);
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const category = await this.findCategoryById(id);
    await this.categoryRepository.update(id, { isActive: !category.isActive });
    return this.findCategoryById(id);
  }
}