# The Loft Coimbatore POS Backend

A comprehensive Point of Sale (POS) system backend built with NestJS, TypeORM, and MySQL for The Loft Coimbatore theatre.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based permissions
- **User Management**: Users, roles, and permissions system
- **Menu Management**: Categories and menu items with pricing
- **Order Management**: Complete order processing with items and payments
- **Payment Integration**: Razorpay payment gateway integration
- **Reports & Analytics**: Comprehensive reporting system
- **Audit Logging**: Complete audit trail for all actions
- **Settings Management**: Configurable system settings
- **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Passport
- **Payment Gateway**: Razorpay
- **Documentation**: Swagger/OpenAPI
- **Validation**: Class Validator
- **Email**: Nodemailer

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   - Database credentials
   - JWT secret
   - Razorpay keys
   - Email configuration

4. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE loft_pos;
   
   # Run migrations (if using migrations)
   npm run migration:run
   
   # Or use synchronize for development
   # Set synchronize: true in database config
   ```

5. **Seed Database**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **API Base URL**: http://localhost:3001/api

## Default Users

After seeding, you can login with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@theloftscreening.com | password123 |
| Manager | manager@theloftscreening.com | password123 |
| Cashier | cashier@theloftscreening.com | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/validate` - Validate token

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Menu
- `GET /api/menu/categories` - Get all categories
- `POST /api/menu/categories` - Create category
- `GET /api/menu/items` - Get all menu items
- `POST /api/menu/items` - Create menu item
- `GET /api/menu/items/active` - Get active menu items

### Orders
- `GET /api/orders` - Get all orders (with filters)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id` - Update order
- `GET /api/orders/today` - Get today's orders
- `GET /api/orders/stats` - Get order statistics

### Payments
- `POST /api/payments/razorpay/create-order/:orderId` - Create Razorpay order
- `POST /api/payments` - Create payment record
- `POST /api/payments/verify` - Verify Razorpay payment
- `POST /api/payments/:id/refund` - Refund payment
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get payment statistics

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/items` - Get item performance report
- `GET /api/reports/daily` - Get daily sales report
- `GET /api/reports/customers` - Get customer analytics
- `GET /api/reports/export/:type` - Export report as CSV

### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Create setting
- `GET /api/settings/:key` - Get setting by key
- `PATCH /api/settings/:key` - Update setting
- `POST /api/settings/initialize` - Initialize default settings

### Audit
- `GET /api/audit` - Get audit logs (with filters)
- `GET /api/audit/stats` - Get audit statistics

## Database Schema

### Key Entities

1. **Users & Roles**
   - `users` - User accounts
   - `roles` - User roles (Admin, Manager, Cashier)
   - `permissions` - System permissions
   - `role_permissions` - Role-permission mapping

2. **Menu Management**
   - `categories` - Menu categories
   - `menu_items` - Menu items with pricing

3. **Orders & Payments**
   - `orders` - Customer orders
   - `order_items` - Order line items
   - `payments` - Payment records

4. **System**
   - `settings` - System configuration
   - `audit_logs` - Audit trail

## Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secret
   - Configure production Razorpay keys

3. **Run migrations**
   ```bash
   npm run migration:run
   ```

4. **Start the application**
   ```bash
   npm run start:prod
   ```

## Security Considerations

- JWT tokens expire in 24 hours by default
- Passwords are hashed using bcrypt
- API endpoints are protected with JWT authentication
- Role-based access control for different user types
- Audit logging for all critical actions
- Input validation using class-validator
- SQL injection protection via TypeORM

## Support

For support and questions, please contact the development team or create an issue in the repository.