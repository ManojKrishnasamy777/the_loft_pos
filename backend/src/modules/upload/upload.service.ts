import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    const folders = ['products', 'email-config'];
    folders.forEach(folder => {
      const folderPath = path.join(this.uploadPath, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });
  }

  async uploadProductImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'products');
  }

  async uploadEmailConfigImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'email-config');
  }

  private async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;

    const folderPath = path.join(this.uploadPath, folder);
    const filePath = path.join(folderPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `${this.baseUrl}/uploads/${folder}/${filename}`;
    return fileUrl;
  }

  deleteFile(fileUrl: string): void {
    try {
      const urlPath = fileUrl.replace(this.baseUrl, '');
      const filePath = path.join(process.cwd(), urlPath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
