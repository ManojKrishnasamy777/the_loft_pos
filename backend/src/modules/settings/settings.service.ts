import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  async findAll(): Promise<Setting[]> {
    return this.settingRepository.find({
      where: { isActive: true },
      order: { key: 'ASC' },
    });
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { key, isActive: true },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    return setting;
  }

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const existingSetting = await this.settingRepository.findOne({
      where: { key: createSettingDto.key },
    });

    if (existingSetting) {
      throw new Error(`Setting with key '${createSettingDto.key}' already exists`);
    }

    const setting = this.settingRepository.create(createSettingDto);
    return this.settingRepository.save(setting);
  }

  async update(key: string, updateSettingDto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.findByKey(key);
    await this.settingRepository.update(setting.id, updateSettingDto);
    return this.findByKey(key);
  }

  async remove(key: string): Promise<void> {
    const setting = await this.findByKey(key);
    await this.settingRepository.remove(setting);
  }

  async getValue(key: string, defaultValue?: string): Promise<string> {
    try {
      const setting = await this.findByKey(key);
      return setting.value;
    } catch (error) {
      return defaultValue || '';
    }
  }

  async setValue(key: string, value: string, description?: string): Promise<Setting> {
    try {
      const setting = await this.findByKey(key);
      return this.update(key, { value, description });
    } catch (error) {
      return this.create({ key, value, description });
    }
  }

  async getSettings(keys: string[]): Promise<{ [key: string]: string }> {
    const settings = await this.settingRepository.find({
      where: keys.map(key => ({ key, isActive: true })),
    });

    const result = {};
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });

    return result;
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'company_name',
        value: 'The Loft Coimbatore',
        description: 'Company name for invoices and receipts',
      },
      {
        key: 'company_address',
        value: 'Coimbatore, Tamil Nadu, India',
        description: 'Company address for invoices',
      },
      {
        key: 'company_phone',
        value: '+91-XXXXXXXXXX',
        description: 'Company phone number',
      },
      {
        key: 'company_email',
        value: 'info@theloftscreening.com',
        description: 'Company email address',
      },
      {
        key: 'tax_rate',
        value: '0.18',
        description: 'Default tax rate (GST)',
      },
      {
        key: 'currency',
        value: 'INR',
        description: 'Default currency',
      },
      {
        key: 'currency_symbol',
        value: '₹',
        description: 'Currency symbol',
      },
      {
        key: 'receipt_footer',
        value: 'Thank you for visiting The Loft Coimbatore!',
        description: 'Footer text for receipts',
      },
      {
        key: 'razorpay_key_id',
        value: '',
        description: 'Razorpay Key ID for payments',
      },
      {
        key: 'razorpay_webhook_secret',
        value: '',
        description: 'Razorpay webhook secret',
      },
      {
        key: 'email_enabled',
        value: 'false',
        description: 'Enable email notifications',
      },
      {
        key: 'printer_enabled',
        value: 'false',
        description: 'Enable thermal printer',
      },
      {
        key: 'printer_name',
        value: '',
        description: 'Thermal printer name/IP',
      },
    ];

    for (const setting of defaultSettings) {
      try {
        await this.findByKey(setting.key);
      } catch (error) {
        await this.create(setting);
      }
    }
  }
}