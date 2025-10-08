# Database Setup Instructions

Your POS application now has a complete user management system with roles and permissions. To use this system, you need to set up the Supabase database.

## Prerequisites

You already have Supabase credentials configured in your `.env` file:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema Setup

Run the following SQL script in your Supabase SQL Editor to create all necessary tables:

```sql
-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE RESTRICT,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Enable Row Level Security
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions table
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for roles table
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete roles"
  ON roles FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for role_permissions table
CREATE POLICY "Authenticated users can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage role permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for users table
CREATE POLICY "Authenticated users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  -- Menu permissions
  ('menu:create', 'menu', 'create', 'Create menu items and categories'),
  ('menu:read', 'menu', 'read', 'View menu items and categories'),
  ('menu:update', 'menu', 'update', 'Update menu items and categories'),
  ('menu:delete', 'menu', 'delete', 'Delete menu items and categories'),

  -- Order permissions
  ('orders:create', 'orders', 'create', 'Create new orders'),
  ('orders:read', 'orders', 'read', 'View orders'),
  ('orders:update', 'orders', 'update', 'Update order status'),
  ('orders:delete', 'orders', 'delete', 'Cancel/delete orders'),

  -- Payment permissions
  ('payments:process', 'payments', 'process', 'Process payments'),
  ('payments:refund', 'payments', 'refund', 'Issue refunds'),
  ('payments:read', 'payments', 'read', 'View payment information'),

  -- Customer permissions
  ('customers:create', 'customers', 'create', 'Create customer records'),
  ('customers:read', 'customers', 'read', 'View customer information'),
  ('customers:update', 'customers', 'update', 'Update customer information'),
  ('customers:delete', 'customers', 'delete', 'Delete customer records'),

  -- User permissions
  ('users:create', 'users', 'create', 'Create user accounts'),
  ('users:read', 'users', 'read', 'View user accounts'),
  ('users:update', 'users', 'update', 'Update user accounts'),
  ('users:delete', 'users', 'delete', 'Delete user accounts'),

  -- Role permissions
  ('roles:create', 'roles', 'create', 'Create roles'),
  ('roles:read', 'roles', 'read', 'View roles'),
  ('roles:update', 'roles', 'update', 'Update roles'),
  ('roles:delete', 'roles', 'delete', 'Delete roles'),

  -- Reports permissions
  ('reports:sales', 'reports', 'sales', 'View sales reports'),
  ('reports:inventory', 'reports', 'inventory', 'View inventory reports'),
  ('reports:staff', 'reports', 'staff', 'View staff performance reports'),

  -- Settings permissions
  ('settings:read', 'settings', 'read', 'View system settings'),
  ('settings:update', 'settings', 'update', 'Update system settings')
ON CONFLICT (name) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description, is_active) VALUES
  ('Admin', 'Full system access with all permissions', true),
  ('Manager', 'Manage operations, view reports, manage staff', true),
  ('Cashier', 'Process orders and payments, basic operations', true)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Admin role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- Assign permissions to Manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manager'
  AND p.name IN (
    'menu:create', 'menu:read', 'menu:update', 'menu:delete',
    'orders:create', 'orders:read', 'orders:update',
    'payments:process', 'payments:read', 'payments:refund',
    'customers:create', 'customers:read', 'customers:update',
    'users:read',
    'roles:read',
    'reports:sales', 'reports:inventory', 'reports:staff',
    'settings:read'
  )
ON CONFLICT DO NOTHING;

-- Assign permissions to Cashier role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Cashier'
  AND p.name IN (
    'menu:read',
    'orders:create', 'orders:read',
    'payments:process', 'payments:read',
    'customers:read'
  )
ON CONFLICT DO NOTHING;

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Next Steps

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: vidwjpeoboyozankipta
3. **Navigate to SQL Editor**
4. **Paste and run the SQL script above**
5. **Create your first admin user** through the application UI once the tables are created

## Features Included

### User Management
- Add, edit, and delete users
- Assign roles to users
- Enable/disable user accounts
- Password management with validation
- Email validation

### Role Management
- Create custom roles
- Assign multiple permissions to roles
- Enable/disable roles
- View role details and permission counts

### Permission Management
- View all system permissions
- Filter permissions by resource
- Organized by resource type (menu, orders, payments, etc.)
- Action types: create, read, update, delete, and custom actions

### Security Features
- Row Level Security (RLS) enabled on all tables
- Password hashing (implement bcrypt hashing in your backend)
- Authentication required for all operations
- Fine-grained permission control

## Default Roles

The system comes with three predefined roles:

1. **Admin**: Full system access with all permissions
2. **Manager**: Can manage operations, view reports, and manage staff
3. **Cashier**: Can process orders and payments with basic operations

You can create additional roles and customize permissions through the UI.

## Usage

Once the database is set up:

1. Navigate to **Settings > User Management** to manage users
2. Navigate to **Settings > Role Management** to manage roles and permissions
3. Navigate to **Settings > Permissions** to view all available permissions
4. Add your first admin user with the Admin role
5. The system is ready to use!

## Important Security Notes

- **Never commit database credentials** to version control
- **Use strong passwords** for all user accounts (minimum 6 characters)
- **Regularly review user permissions** to ensure appropriate access
- **Enable MFA** for admin accounts when available
- **Implement password hashing** using bcrypt on the backend before storing

## Troubleshooting

If you encounter issues:

1. Verify your Supabase credentials in `.env` are correct
2. Ensure all tables are created successfully
3. Check that RLS policies are enabled
4. Verify the default roles and permissions were inserted
5. Check browser console for error messages
