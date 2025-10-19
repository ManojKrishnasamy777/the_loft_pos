import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    /** Get root storage path (from .env or default ./uploads) */
    private getBasePath(): string {
        return process.env.STORAGE_PATH || path.join(__dirname, '../../../uploads');
    }

    /** Ensure subdirectory exists (e.g., menu, products, gallery) */
    private ensureDir(folder: string): string {
        const dirPath = path.join(this.getBasePath(), folder);
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        return dirPath;
    }

    /** Save base64 image to disk and return relative path (e.g., /uploads/menu/img_123.png) */
    saveBase64Image(base64: string, folder: string): string {
        try {
            const matches = base64.match(/^data:(.+);base64,(.+)$/);
            if (!matches || matches.length !== 3)
                throw new Error('Invalid Base64 format');

            const mime = matches[1];
            const ext = mime.split('/')[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `${folder}_${Date.now()}.${ext}`;

            const dir = this.ensureDir(folder);
            const filePath = path.join(dir, filename);
            fs.writeFileSync(filePath, buffer);

            // Return relative URL path for serving
            return `${process.env.FRONTEND_URL}/backend/uploads/${folder}/${filename}`;
        } catch (err) {
            throw new BadRequestException('Failed to save image file');
        }
    }

    /** Delete an existing file safely */
    deleteFile(relativePath: string): void {
        try {
            if (!relativePath) return;
            const absPath = path.join(this.getBasePath(), '..', relativePath);
            if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
        } catch (err) {
            console.warn('Failed to delete file:', relativePath);
        }
    }
}
