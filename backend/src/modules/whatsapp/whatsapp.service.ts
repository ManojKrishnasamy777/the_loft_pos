import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as Papa from 'papaparse';

interface WhatsAppTemplate {
  name: string;
  language: string;
  components?: any[];
}

interface Recipient {
  phone: string;
  name?: string;
  variables?: string[];
}

@Injectable()
export class WhatsAppService {
  private readonly accessToken: string;
  private readonly phoneNumberId: string;
  private readonly apiUrl: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;

    if (!this.accessToken || !this.phoneNumberId) {
      console.warn('WhatsApp credentials not configured');
    }
  }

  async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    languageCode: string = 'en',
    parameters?: string[],
  ): Promise<any> {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new BadRequestException('WhatsApp not configured. Please set credentials in environment variables');
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const messagePayload: any = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    if (parameters && parameters.length > 0) {
      messagePayload.template.components = [
        {
          type: 'body',
          parameters: parameters.map((param) => ({
            type: 'text',
            text: param,
          })),
        },
      ];
    }

    try {
      const response = await axios.post(this.apiUrl, messagePayload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        phone: formattedPhone,
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      throw new BadRequestException(
        error.response?.data?.error?.message || 'Failed to send WhatsApp message',
      );
    }
  }

  async sendBulkMessages(
    recipients: Recipient[],
    templateName: string,
    languageCode: string = 'en',
  ): Promise<any> {
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendTemplateMessage(
          recipient.phone,
          templateName,
          languageCode,
          recipient.variables,
        );
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'success',
          messageId: result.messageId,
        });
      } catch (error) {
        errors.push({
          phone: recipient.phone,
          name: recipient.name,
          status: 'failed',
          error: error.message,
        });
      }

      await this.delay(1000);
    }

    return {
      total: recipients.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async parseCSV(fileContent: string): Promise<Recipient[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const recipients: Recipient[] = results.data.map((row: any) => {
            const recipient: Recipient = {
              phone: row.phone || row.Phone || row.mobile || row.Mobile || row.number || row.Number,
              name: row.name || row.Name || '',
            };

            const variables: string[] = [];
            Object.keys(row).forEach((key) => {
              if (key.startsWith('var') || key.startsWith('param')) {
                variables.push(row[key]);
              }
            });

            if (variables.length > 0) {
              recipient.variables = variables;
            }

            return recipient;
          });

          const validRecipients = recipients.filter(r => r.phone && r.phone.trim() !== '');
          resolve(validRecipients);
        },
        error: (error) => {
          reject(new BadRequestException(`CSV parsing error: ${error.message}`));
        },
      });
    });
  }

  async getAvailableTemplates(): Promise<any[]> {
    if (!this.accessToken || !process.env.WHATSAPP_BUSINESS_ACCOUNT_ID) {
      throw new BadRequestException('WhatsApp not configured');
    }

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params: {
            limit: 100,
          },
        },
      );

      return response.data.data.map((template: any) => ({
        id: template.id,
        name: template.name,
        language: template.language,
        status: template.status,
        category: template.category,
        components: template.components,
      }));
    } catch (error) {
      console.error('Failed to fetch templates:', error.response?.data || error.message);
      throw new BadRequestException('Failed to fetch WhatsApp templates');
    }
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }

    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }

    return cleaned;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
