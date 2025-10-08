import { apiClient } from '../config/api';

export const imageService = {
  async uploadImage(file: File): Promise<string> {
    const response = await apiClient.uploadImage(file);
    return response.url;
  },

  async deleteImage(imageUrl: string): Promise<void> {
    await apiClient.deleteImage(imageUrl);
  },

  async updateImage(oldImageUrl: string | null, newFile: File): Promise<string> {
    if (oldImageUrl) {
      await this.deleteImage(oldImageUrl);
    }
    return this.uploadImage(newFile);
  },
};
