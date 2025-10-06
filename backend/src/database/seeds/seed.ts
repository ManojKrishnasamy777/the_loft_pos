import { AppDataSource } from '../../config/database.config';
import { Permission } from '../../entities/permission.entity';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding...');

    // ---------- Clear existing data ----------
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await AppDataSource.query('TRUNCATE TABLE role_permissions');
    await AppDataSource.query('TRUNCATE TABLE users');
    await AppDataSource.query('TRUNCATE TABLE roles');
    await AppDataSource.query('TRUNCATE TABLE permissions');
    await AppDataSource.query('TRUNCATE TABLE menu_items');
    await AppDataSource.query('TRUNCATE TABLE categories');
    await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    // ---------- 1. Permissions ----------
    const permissions = [
      { name: 'All Access', resource: '*', action: '*', description: 'Full system access' },
      { name: 'Dashboard Read', resource: 'dashboard', action: 'read', description: 'View dashboard' },
      { name: 'POS Access', resource: 'pos', action: 'read,write', description: 'Access POS system' },
      { name: 'Orders Read', resource: 'orders', action: 'read', description: 'View orders' },
      { name: 'Orders Write', resource: 'orders', action: 'write', description: 'Create/update orders' },
      { name: 'Menu Read', resource: 'menu', action: 'read', description: 'View menu items' },
      { name: 'Menu Write', resource: 'menu', action: 'write', description: 'Manage menu items' },
      { name: 'Reports Read', resource: 'reports', action: 'read', description: 'View reports' },
      { name: 'Settings Read', resource: 'settings', action: 'read', description: 'View settings' },
      { name: 'Settings Write', resource: 'settings', action: 'write', description: 'Manage settings' },
      { name: 'Users Read', resource: 'users', action: 'read', description: 'View users' },
      { name: 'Users Write', resource: 'users', action: 'write', description: 'Manage users' },
    ];
    const savedPermissions = await AppDataSource.manager.save(Permission, permissions);
    console.log('✅ Permissions created');

    // ---------- 2. Roles ----------
    const adminRole = await AppDataSource.manager.save(Role, {
      name: 'Administrator',
      description: 'Full system administrator',
      permissions: [savedPermissions[0]], // All Access
    });

    const managerRole = await AppDataSource.manager.save(Role, {
      name: 'Manager',
      description: 'Theatre manager with reporting access',
      permissions: savedPermissions.filter(p =>
        ['dashboard', 'pos', 'orders', 'menu', 'reports'].includes(p.resource)
      ),
    });

    // --- Cashier role: deduplicate permissions ---
    const cashierPermissions = Array.from(
      new Map(
        savedPermissions
          .filter(
            p =>
              ['dashboard', 'pos', 'orders'].includes(p.resource) &&
              p.action !== 'write'
          )
          .concat(
            savedPermissions.filter(
              p => p.resource === 'pos' && p.action.includes('write')
            )
          )
          .map(p => [p.id, p]) // Map by id removes duplicates
      ).values()
    );

    const cashierRole = await AppDataSource.manager.save(Role, {
      name: 'Cashier',
      description: 'POS operator',
      permissions: cashierPermissions,
    });

    console.log('✅ Roles created');

    // ---------- 3. Users ----------
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      {
        name: 'Admin User',
        email: 'admin@theloftscreening.com',
        password: hashedPassword,
        roleId: adminRole.id,
      },
      {
        name: 'Theatre Manager',
        email: 'manager@theloftscreening.com',
        password: hashedPassword,
        roleId: managerRole.id,
      },
      {
        name: 'Cashier',
        email: 'cashier@theloftscreening.com',
        password: hashedPassword,
        roleId: cashierRole.id,
      },
    ];
    await AppDataSource.manager.save(User, users);
    console.log('✅ Users created');

    // ---------- 4. Categories ----------
    const categories = [
      { name: 'Beverages', description: 'Hot and cold drinks', sortOrder: 1 },
      { name: 'Snacks', description: 'Theatre snacks and treats', sortOrder: 2 },
      { name: 'Main Course', description: 'Full meals and main dishes', sortOrder: 3 },
      { name: 'Desserts', description: 'Sweet treats and desserts', sortOrder: 4 },
    ];
    const savedCategories = await AppDataSource.manager.save(Category, categories);
    console.log('✅ Categories created');

    // ---------- 5. Menu Items ----------
    const menuItems = [
      {
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea',
        price: 25,
        categoryId: savedCategories[0].id,
        taxRate: 0.05,
        image:
          'https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Filter Coffee',
        description: 'South Indian filter coffee',
        price: 30,
        categoryId: savedCategories[0].id,
        taxRate: 0.05,
        image:
          'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime soda',
        price: 35,
        categoryId: savedCategories[0].id,
        taxRate: 0.12,
        image:
          'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Samosa',
        description: 'Crispy fried pastry with spiced filling',
        price: 20,
        categoryId: savedCategories[1].id,
        taxRate: 0.05,
        image:
          'https://images.pexels.com/photos/11214459/pexels-photo-11214459.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Popcorn',
        description: 'Classic theatre popcorn',
        price: 80,
        categoryId: savedCategories[1].id,
        taxRate: 0.18,
        image:
          'https://images.pexels.com/photos/1404815/pexels-photo-1404815.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Nachos with Cheese',
        description: 'Crispy nachos with melted cheese',
        price: 120,
        categoryId: savedCategories[1].id,
        taxRate: 0.18,
        image:
          'https://images.pexels.com/photos/1166120/pexels-photo-1166120.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Veg Biryani',
        description: 'Aromatic vegetable biryani',
        price: 180,
        categoryId: savedCategories[2].id,
        taxRate: 0.05,
        image:
          'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Chicken Biryani',
        description: 'Traditional chicken biryani',
        price: 220,
        categoryId: savedCategories[2].id,
        taxRate: 0.05,
        image:
          'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Ice Cream',
        description: 'Vanilla ice cream scoop',
        price: 60,
        categoryId: savedCategories[3].id,
        taxRate: 0.18,
        image:
          'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
      {
        name: 'Chocolate Brownie',
        description: 'Rich chocolate brownie with nuts',
        price: 90,
        categoryId: savedCategories[3].id,
        taxRate: 0.18,
        image:
          'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=300',
      },
    ];
    await AppDataSource.manager.save(MenuItem, menuItems);
    console.log('✅ Menu items created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n👤 Default users created:');
    console.log('📧 admin@theloftscreening.com (Administrator)');
    console.log('📧 manager@theloftscreening.com (Manager)');
    console.log('📧 cashier@theloftscreening.com (Cashier)');
    console.log('🔑 Password for all users: password123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
