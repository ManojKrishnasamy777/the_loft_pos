import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Menu Items
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, description: 'Menu items retrieved successfully' })
  @Get('items')
  findAllMenuItems() {
    return this.menuService.findAllMenuItems();
  }

  @ApiOperation({ summary: 'Get active menu items' })
  @ApiResponse({ status: 200, description: 'Active menu items retrieved successfully' })
  @Get('items/active')
  findActiveMenuItems() {
    return this.menuService.findActiveMenuItems();
  }

  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({ status: 200, description: 'Menu item retrieved successfully' })
  @Get('items/:id')
  findMenuItemById(@Param('id') id: string) {
    return this.menuService.findMenuItemById(id);
  }

  @ApiOperation({ summary: 'Create menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @Post('items')
  createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(createMenuItemDto);
  }

  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @Patch('items/:id')
  updateMenuItem(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto);
  }

  @ApiOperation({ summary: 'Toggle menu item status' })
  @ApiResponse({ status: 200, description: 'Menu item status toggled successfully' })
  @Patch('items/:id/toggle-status')
  toggleMenuItemStatus(@Param('id') id: string) {
    return this.menuService.toggleMenuItemStatus(id);
  }

  @ApiOperation({ summary: 'Delete menu item' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @Delete('items/:id')
  removeMenuItem(@Param('id') id: string) {
    return this.menuService.removeMenuItem(id);
  }

  // Categories
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @Get('categories')
  findAllCategories() {
    return this.menuService.findAllCategories();
  }

  @ApiOperation({ summary: 'Get active categories' })
  @ApiResponse({ status: 200, description: 'Active categories retrieved successfully' })
  @Get('categories/active')
  findActiveCategories() {
    return this.menuService.findActiveCategories();
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @Get('categories/:id')
  findCategoryById(@Param('id') id: string) {
    return this.menuService.findCategoryById(id);
  }

  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.menuService.createCategory(createCategoryDto);
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.menuService.updateCategory(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Toggle category status' })
  @ApiResponse({ status: 200, description: 'Category status toggled successfully' })
  @Patch('categories/:id/toggle-status')
  toggleCategoryStatus(@Param('id') id: string) {
    return this.menuService.toggleCategoryStatus(id);
  }

  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.menuService.removeCategory(id);
  }
}