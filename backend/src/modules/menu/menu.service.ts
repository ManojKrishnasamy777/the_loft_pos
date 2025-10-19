import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../../entities/menu-item.entity';
import { Category } from '../../entities/category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly storageService: StorageService, // ✅ injected
  ) { }

  // ========================================================
  // 🍴 MENU ITEMS
  // ========================================================

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
    if (!menuItem) throw new NotFoundException('Menu item not found');
    return menuItem;
  }

  async createMenuItem(dto: CreateMenuItemDto): Promise<MenuItem> {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const menuItem = this.menuItemRepository.create(dto);

    // ✅ Save image via StorageService
    if (dto.image && dto.image.startsWith('data:')) {
      menuItem.image = this.storageService.saveBase64Image(dto.image, 'menu');
    }

    const saved = await this.menuItemRepository.save(menuItem);
    return this.findMenuItemById(saved.id);
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.findMenuItemById(id);

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    // ✅ Update image via StorageService
    if (dto.image && dto.image.startsWith('data:')) {
      const newPath = this.storageService.saveBase64Image(dto.image, 'menu');
      this.storageService.deleteFile(menuItem.image); // delete old image
      dto.image = newPath;
    }

    await this.menuItemRepository.update(id, dto);
    return this.findMenuItemById(id);
  }

  async removeMenuItem(id: string): Promise<void> {
    const menuItem = await this.findMenuItemById(id);
    this.storageService.deleteFile(menuItem.image); // delete image
    await this.menuItemRepository.remove(menuItem);
  }

  async toggleMenuItemStatus(id: string): Promise<MenuItem> {
    const menuItem = await this.findMenuItemById(id);
    await this.menuItemRepository.update(id, { isActive: !menuItem.isActive });
    return this.findMenuItemById(id);
  }

  // ========================================================
  // 🗂️ CATEGORIES
  // ========================================================

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
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findCategoryById(id);
    await this.categoryRepository.update(id, dto);
    return this.findCategoryById(id);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);

    const count = await this.menuItemRepository.count({
      where: { categoryId: id },
    });

    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete category with existing menu items',
      );
    }

    await this.categoryRepository.remove(category);
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const category = await this.findCategoryById(id);
    await this.categoryRepository.update(id, { isActive: !category.isActive });
    return this.findCategoryById(id);
  }
}
