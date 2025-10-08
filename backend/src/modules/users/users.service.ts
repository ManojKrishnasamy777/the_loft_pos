import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'role.permissions'],
      select: ['id', 'name', 'email', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
      select: ['id', 'name', 'email', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const role = await this.rolesRepository.findOne({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.findById(savedUser.id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.roleId) {
      const role = await this.rolesRepository.findOne({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    await this.usersRepository.update(id, { isActive: !user.isActive });
    return this.findById(id);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'ASC' },
    });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async createRole(data: { name: string; description?: string; isActive: boolean }): Promise<Role> {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.rolesRepository.create(data);
    return this.rolesRepository.save(role);
  }

  async updateRole(id: string, data: { name?: string; description?: string; isActive?: boolean }): Promise<Role> {
    const role = await this.findRoleById(id);

    if (data.name && data.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    await this.rolesRepository.update(id, data);
    return this.findRoleById(id);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);

    const usersWithRole = await this.usersRepository.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      throw new ConflictException('Cannot delete role that is assigned to users');
    }

    await this.rolesRepository.remove(role);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findRoleById(roleId);

    const permissions = await this.permissionsRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('Some permissions were not found');
    }

    role.permissions = permissions;
    await this.rolesRepository.save(role);

    return this.findRoleById(roleId);
  }
}