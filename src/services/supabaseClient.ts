import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role?: Role;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role_id: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role_id?: string;
  is_active?: boolean;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(
          *,
          permissions:role_permissions(
            permission:permissions(*)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(
          *,
          permissions:role_permissions(
            permission:permissions(*)
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('User not found');
    return data;
  },

  async create(userData: CreateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select(`
        *,
        role:roles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleStatus(id: string): Promise<User> {
    const user = await this.getById(id);
    return this.update(id, { is_active: !user.is_active });
  }
};

export const roleService = {
  async getAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        permissions:role_permissions(
          permission:permissions(*)
        )
      `)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        permissions:role_permissions(
          permission:permissions(*)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Role not found');
    return data;
  },

  async create(roleData: { name: string; description?: string; is_active?: boolean }): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert([roleData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, roleData: { name?: string; description?: string; is_active?: boolean }): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .update(roleData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updatePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (permissionIds.length > 0) {
      const { error } = await supabase
        .from('role_permissions')
        .insert(permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId
        })));

      if (error) throw error;
    }
  }
};

export const permissionService = {
  async getAll(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource')
      .order('action');

    if (error) throw error;
    return data || [];
  },

  async getByResource(resource: string): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('resource', resource)
      .order('action');

    if (error) throw error;
    return data || [];
  }
};
