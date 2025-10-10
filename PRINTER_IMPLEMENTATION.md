# Thermal Printer Implementation

## Overview
Complete thermal printer system with backend-driven printing, supporting both USB and Network thermal printers.

## Features Implemented

### Backend (NestJS)

#### 1. Database Entity
- **printer_config** table with fields:
  - id, name, type (EPSON/STAR/GENERIC)
  - interface_type (USB/NETWORK)
  - usb_identifier, network_ip, network_port
  - is_default flag

#### 2. Services
- **PrinterConfigService**: CRUD operations for printer configurations
- **ThermalPrintService**: Handles thermal printing with receipt design

#### 3. Controllers
- **PrinterConfigController** (`/api/printer-config`)
  - GET `/` - List all printers
  - GET `/default` - Get default printer
  - GET `/:id` - Get printer by ID
  - POST `/` - Create new printer
  - PUT `/:id` - Update printer
  - PUT `/:id/set-default` - Set as default
  - DELETE `/:id` - Delete printer

- **PrintController** (`/api/print`)
  - POST `/receipt` - Print receipt
  - POST `/test` - Test print

#### 4. Receipt Design
Professional thermal receipt with:
- Store name and address
- Order number and customer name
- Itemized list with quantities and prices
- Subtotal, tax, and total
- Payment method
- Optional QR code
- Professional formatting with lines and alignment

### Frontend (React)

#### 1. Printer Settings Page
- Add/Edit/Delete printer configurations
- Set default printer
- Test print functionality
- Support for USB and Network printers
- User-friendly form with validation

#### 2. POS Integration
- Print receipt button on POS page
- Auto-print on order completion (configurable)
- Print last receipt option
- Toast notifications for print status

## API Endpoints

### Printer Configuration
```
GET    /api/printer-config          - List all printers
GET    /api/printer-config/default  - Get default printer
GET    /api/printer-config/:id      - Get printer by ID
POST   /api/printer-config          - Create printer
PUT    /api/printer-config/:id      - Update printer
PUT    /api/printer-config/:id/set-default - Set default
DELETE /api/printer-config/:id      - Delete printer
```

### Print Operations
```
POST /api/print/receipt - Print receipt
POST /api/print/test    - Test print
```

## Receipt Data Format

```typescript
{
  storeName: string;
  address: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  qrCode?: string;
}
```

## Installation

### Backend Dependencies
```bash
cd backend
npm install node-thermal-printer@4.4.5 --legacy-peer-deps
```

### Printer Setup

#### USB Printer
1. Connect USB thermal printer
2. In settings, add new printer
3. Select "USB" interface type
4. Enter printer name (optional USB identifier)
5. Set as default

#### Network Printer
1. Ensure printer is on network
2. In settings, add new printer
3. Select "Network" interface type
4. Enter IP address and port (default: 9100)
5. Set as default

## Usage

### Configure Printer
1. Navigate to Settings > Thermal Printer
2. Click "Add Printer"
3. Fill in printer details
4. Save and test print

### Print Receipt
- From POS: Complete order (auto-print if enabled)
- Manual print: Click "Print Last Receipt"
- Test print: Settings > Test Print button

## Technical Details

### Printer Types Supported
- EPSON thermal printers
- STAR thermal printers
- Generic ESC/POS compatible printers

### Connection Types
- **USB**: Direct USB connection (Windows printer name)
- **Network**: TCP/IP connection (IP:Port)

### Receipt Format
- Width: 48 characters (thermal paper)
- Paper size: 58mm or 80mm
- QR code support
- ESC/POS commands

## Notes
- Only one default printer allowed
- All printing happens on backend (secure)
- Receipt design is consistent across all printers
- Auto-print configurable via settings
- Test print available for troubleshooting
