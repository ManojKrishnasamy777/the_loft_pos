# The Loft POS - Integrated Features

## Overview

Complete Point of Sale system with backend API and UI integration ready for production use.

## Fully Integrated Features

### 1. POS Interface

- **Menu Management**: Real-time fetching of menu items and categories from API
- **Cart Management**: Add/remove items, update quantities
- **Search & Filter**: Search items by name/description, filter by category
- **Order Processing**: Complete order workflow with multiple payment methods
- **Receipt Printing**: Automatic/manual receipt printing with configurable templates
- **Loading States**: Proper loading indicators during data fetching

**API Endpoints Used:**

- `GET /api/menu/items/active` - Fetch active menu items
- `GET /api/menu/categories/active` - Fetch active categories
- `POST /api/orders` - Create new orders
- `POST /api/payments/razorpay/create-order` - Create Razorpay orders
- `POST /api/payments/verify` - Verify payments

### 2. Dashboard

- **Real-time Statistics**: Today's sales, orders, customers, average order value
- **Recent Orders**: Live feed of recent orders
- **Top Selling Items**: Best performing menu items
- **Quick Actions**: Navigation to POS, Reports, Menu, Settings
- **Functional Navigation**: All buttons linked to appropriate pages

**API Endpoints Used:**

- `GET /api/orders/stats` - Order statistics
- `GET /api/orders/today` - Today's orders
- `GET /api/reports/sales` - Sales report data

### 3. Reports & Analytics

- **Sales Report**: Total sales, orders, average order value
- **Item Performance**: Best/worst performing items
- **Sales Trends**: Daily/hourly sales analysis
- **Customer Analytics**: Customer spending patterns
- **Export Functionality**: Export reports as CSV

**Report Types:**

- Sales Report (revenue, orders, top items)
- Item Performance (quantity sold, revenue by item)
- Daily Sales Trends (time-series analysis)
- Customer Analytics (repeat customers, spending patterns)

**API Endpoints Used:**

- `GET /api/reports/sales` - Sales report
- `GET /api/reports/items` - Item performance
- `GET /api/reports/daily` - Daily sales
- `GET /api/reports/customers` - Customer analytics
- `GET /api/reports/export/:type` - Export reports as CSV

### 4. Settings Module

#### Payment Gateway Settings

- **Razorpay Integration**: Configure API keys and secrets
- **Test Mode**: Toggle between test and live mode
- **Connection Testing**: Test payment gateway connection
- **Multi-Currency**: Support for INR, USD, EUR
- **Status Indicator**: Visual gateway connection status

**API Endpoints Used:**

- `GET /api/settings` - Load all settings
- `PATCH /api/settings/:key` - Update individual settings

#### Printer Configuration

- **Printer Types**: Thermal, Inkjet, Laser
- **Network Printing**: Configure IP and port
- **Paper Sizes**: 58mm, 80mm, A4
- **Auto-print**: Automatic receipt printing after order
- **Receipt Format**: Configure logo, GST, QR code display
- **Test Print**: Test printer configuration

**API Endpoints Used:**

- `GET /api/settings` - Load printer settings
- `PATCH /api/settings/printer_type` - Update printer type
- `PATCH /api/settings/printer_ip` - Update printer IP
- `PATCH /api/settings/printer_port` - Update printer port
- `PATCH /api/settings/printer_paper_size` - Update paper size
- `PATCH /api/settings/auto_print` - Update auto-print setting

#### Tax Settings

- **Tax Rates**: Configure GST rates (5%, 12%, 18%, 28%)
- **Default Rate**: Set default tax rate for new items
- **Enable/Disable**: Toggle tax calculation
- **GST Information**: Built-in GST rate guidance

**API Endpoints Used:**

- `GET /api/settings` - Load tax settings
- `PATCH /api/settings/tax_rate` - Update tax rate
- `PATCH /api/settings/tax_enabled` - Enable/disable tax

#### User Management

- **User Listing**: View all system users
- **Roles**: Admin, Manager, Cashier
- **Status Management**: Active/Inactive users
- **User Creation**: Add new users (UI ready)
- **Permissions**: Role-based access control

**API Endpoints Used:**

- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Security Settings

- Session management
- Password policies
- Access control
- Audit logging

#### Notification Settings

- Email notifications
- SMTP configuration
- Order confirmations
- Receipt emails

#### Backup & Restore

- Automatic backups
- Manual backup/restore
- Backup scheduling
- Data retention policies

### 5. Orders Management

- **Order Listing**: View all orders with filters
- **Order Details**: Complete order information
- **Status Tracking**: Pending, Completed, Cancelled
- **Payment Status**: Track payment status
- **Search & Filter**: Filter by date, status, payment method

**API Endpoints Used:**

- `GET /api/orders` - List orders with pagination
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order
- `GET /api/orders/today` - Today's orders

### 6. Menu Management

- **Category Management**: Create/edit categories
- **Item Management**: Add/edit menu items
- **Pricing**: Set prices and cost prices
- **Availability**: Toggle item availability
- **Images**: Upload item images
- **Sorting**: Display order management

**API Endpoints Used:**

- `GET /api/menu/categories` - List categories
- `POST /api/menu/categories` - Create category
- `PATCH /api/menu/categories/:id` - Update category
- `GET /api/menu/items` - List items
- `POST /api/menu/items` - Create item
- `PATCH /api/menu/items/:id` - Update item

### 7. Payment Processing

- **Multiple Payment Methods**:
  - Cash
  - Card (via Razorpay)
  - UPI (via Razorpay)
  - Net Banking (via Razorpay)
- **Razorpay Integration**: Secure online payments
- **Payment Verification**: Webhook and signature verification
- **Transaction History**: Complete payment records

**API Endpoints Used:**

- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments` - Payment history

### 8. Receipt Printing

- **Print Service**: Centralized printing functionality
- **Receipt Templates**: Customizable receipt layout
- **Auto-print**: Automatic printing after order
- **Manual Print**: Print last receipt anytime
- **Test Print**: Test printer configuration
- **Browser Print**: Falls back to browser print dialog
- **Download Option**: Save receipt as HTML if printer unavailable

**Features:**

- Company information (name, address, phone)
- Order details (number, customer, date)
- Itemized list with quantities and prices
- Tax breakdown (GST)
- Total calculation
- Payment method
- Receipt footer message
- Timestamp

### 9. Audit Logging

- **Activity Tracking**: Track all system activities
- **User Actions**: Log user operations
- **Change History**: Track data changes
- **Security Events**: Monitor security-related events
- **Filter & Search**: Find specific audit logs

**API Endpoints Used:**

- `GET /api/audit` - List audit logs
- `GET /api/audit/stats` - Audit statistics

## Backend Architecture

### Technologies

- **Framework**: NestJS
- **Database**: MySQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Payment**: Razorpay integration

### Database Entities

- Users (with roles and permissions)
- Roles & Permissions
- Categories
- Menu Items
- Orders & Order Items
- Payments
- Settings
- Audit Logs

### API Features

- RESTful endpoints
- JWT authentication
- Role-based access control
- Input validation
- Error handling
- Swagger documentation
- CORS enabled
- Audit logging

## Frontend Architecture

### Technologies

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build**: Vite
- **HTTP Client**: Fetch API

### Context Providers

- **AuthContext**: Authentication state management
- **POSContext**: Cart and order management
- **PaymentContext**: Payment processing

### Services

- **apiClient**: Centralized API communication
- **PrintService**: Receipt printing functionality

### Features

- Responsive design
- Loading states
- Error handling
- Toast notifications
- Protected routes
- Session management

## Configuration

### Environment Variables

#### Frontend (.env)

```
VITE_API_URL=https://theloftpos.metabustech.com//api
```

#### Backend (.env)

```
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=loft_pos

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Getting Started

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE loft_pos"

# Run migrations (TypeORM auto-syncs in dev mode)
# Or manually run seed script
cd backend
npm run seed
```

### Running the Application

#### Development Mode

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run start:dev
```

#### Production Mode

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Start backend
npm run start:prod
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: https://theloftpos.metabustech.com//api
- **API Documentation**: https://theloftpos.metabustech.com//api/docs

## Testing

### Default Login Credentials

```
Email: admin@theloftscreening.com
Password: Admin@123
```

### Test Payment (Razorpay Test Mode)

```
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

## API Documentation

Access Swagger documentation at:

```
https://theloftpos.metabustech.com//api/docs
```

## Security Features

- JWT-based authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- CORS protection
- Audit logging
- Session management

## Performance Optimizations

- Database indexing
- Query optimization
- Lazy loading
- Code splitting
- Caching strategies
- Pagination

## Future Enhancements

- Real-time order updates (WebSocket)
- Mobile app (React Native)
- Inventory management
- Loyalty program
- Multi-location support
- Advanced analytics
- Email/SMS notifications
- Payment gateway alternatives

## Support

For issues or questions:

- Check API documentation: https://theloftpos.metabustech.com//api/docs
- Review backend logs: `backend/logs/`
- Check browser console for frontend errors

## License

Proprietary - The Loft Coimbatore
