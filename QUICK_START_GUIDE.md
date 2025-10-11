# Quick Start Guide

## Setup Instructions

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
UPLOAD_PATH=./backend/uploads
API_BASE_URL=http://localhost:3000
BACKEND_PORT=3000
```

#### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=pos_db
JWT_SECRET=your-secret-key-change-in-production
UPLOAD_PATH=./uploads
API_BASE_URL=http://localhost:3000

# WhatsApp Configuration (optional - for WhatsApp messaging feature)
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE pos_db;

# Run migrations (if using TypeORM migrations)
cd backend
npm run migration:run
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

Access the application at: `http://localhost:5173`

---

## Feature Usage

### Global Tax Configuration

1. Navigate to **Settings** > **Tax Settings**
2. Set the default tax rate (e.g., 0.18 for 18%)
3. Enable/disable tax calculation
4. All menu items will use this global tax rate

### Image Upload

#### Product Images
1. Go to **Menu Management**
2. Click **Add Item** or **Edit** an existing item
3. Click on the image upload area
4. Select an image (max 5MB, JPEG/PNG/WEBP/GIF)
5. Image will be uploaded automatically when saving

#### Email Logo
1. Navigate to **Settings** > **Email Configuration**
2. Upload logo image
3. Logo will appear in email receipts

### WhatsApp Bulk Messaging

#### Setup (One-time)
1. Create a Meta Business account
2. Set up WhatsApp Business API
3. Create message templates in Meta Business Manager
4. Get templates approved by Meta
5. Add credentials to `backend/.env`

#### Send Messages

##### Individual Message
1. Go to **Settings** > **WhatsApp Messaging**
2. Select a template
3. Choose "Individual" tab
4. Enter phone number (e.g., 919876543210)
5. Add template parameters if needed
6. Click **Send Message**

##### Bulk Messages (Manual Entry)
1. Select "Bulk Entry" tab
2. Add recipients one by one
3. Enter phone numbers and names
4. Click **Send to All**

##### Bulk Messages (File Upload)
1. Select "File Upload" tab
2. Download sample CSV template
3. Fill in your contacts
4. Upload the CSV file
5. Click **Send from File**

---

## API Endpoints

### Upload Endpoints
- `POST /api/upload/product-image` - Upload product image
- `POST /api/upload/email-config-image` - Upload email config image

### WhatsApp Endpoints
- `GET /api/whatsapp/templates` - List available templates
- `POST /api/whatsapp/send` - Send single message
- `POST /api/whatsapp/send-bulk` - Send bulk messages
- `POST /api/whatsapp/send-bulk-csv` - Send from CSV

### Menu Endpoints
- `GET /api/menu/items` - List menu items
- `POST /api/menu/items` - Create menu item
- `PATCH /api/menu/items/:id` - Update menu item

### Orders Endpoints
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order (uses global tax)

---

## Troubleshooting

### WhatsApp Not Working
- Check credentials in `backend/.env`
- Verify templates are approved in Meta Business Manager
- Ensure phone numbers are in correct format (919876543210)
- Check API logs for error messages

### Images Not Showing
- Verify `backend/uploads` folder exists and is writable
- Check `API_BASE_URL` is set correctly
- Ensure backend is running and serving static files

### Tax Not Calculating
- Go to Settings > Tax Settings
- Ensure tax is enabled
- Set a valid tax rate (e.g., 0.18 for 18%)
- Create new orders to see updated tax

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## Production Deployment

### 1. Update Environment Variables
```env
NODE_ENV=production
API_BASE_URL=https://your-domain.com
DB_HOST=your-production-db
```

### 2. Build Frontend
```bash
npm run build
# Deploy dist/ folder to your hosting
```

### 3. Run Backend
```bash
cd backend
npm run build
npm run start:prod
```

### 4. Image Storage
Consider using cloud storage (AWS S3, Cloudinary) for production images instead of local file system.

---

## Support

For issues or questions:
1. Check IMPLEMENTATION_SUMMARY.md for detailed technical information
2. Review error logs in browser console and backend terminal
3. Verify all environment variables are set correctly
