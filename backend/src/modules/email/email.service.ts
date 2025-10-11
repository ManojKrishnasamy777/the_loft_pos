import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailConfig } from '../../entities/email-config.entity';
import { CreateEmailConfigDto } from './dto/create-email-config.dto';
import { UpdateEmailConfigDto } from './dto/update-email-config.dto';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailConfig)
    private emailConfigRepository: Repository<EmailConfig>,
  ) { }

  async createConfig(createDto: CreateEmailConfigDto): Promise<EmailConfig> {
    const config = this.emailConfigRepository.create(createDto);
    return await this.emailConfigRepository.save(config);
  }

  async findAllConfigs(): Promise<EmailConfig[]> {
    return await this.emailConfigRepository.find();
  }

  async findConfigById(id: string): Promise<EmailConfig> {
    const config = await this.emailConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('Email configuration not found');
    }
    return config;
  }

  async getActiveConfig(): Promise<EmailConfig | null> {
    const config = await this.emailConfigRepository.findOne({
      where: { isEnabled: true },
    });
    return config;
  }

  async updateConfig(
    id: string,
    updateDto: UpdateEmailConfigDto,
  ): Promise<EmailConfig> {
    const config = await this.findConfigById(id);
    Object.assign(config, updateDto);
    return await this.emailConfigRepository.save(config);
  }

  async deleteConfig(id: string): Promise<void> {
    const result = await this.emailConfigRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Email configuration not found');
    }
  }

  private async createTransporter(config: EmailConfig) {
    return nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<any> {
    const config = await this.getActiveConfig();
    console.log('Active email config:', config);

    if (!config) {
      throw new Error('No active email configuration found');
    }

    const transporter = await this.createTransporter(config);

    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      text: sendEmailDto.text,
      html: sendEmailDto.html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendOrderConfirmation(orderData: any, customerEmail: string): Promise<any> {
    const config = await this.getActiveConfig();
    console.log('Active email config:', config);
    if (!config) {
      throw new Error('No active email configuration found');
    }

    const orderItems = orderData.items
      .map(
        (item: any) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(item.price * item.quantity).toFixed(2)}</td>
          </tr>`,
      )
      .join('');

    const logoHtml = config.logoUrl
      ? `<img src="${config.logoUrl}" alt="${config.fromName}" style="max-width: 150px; height: auto; margin-bottom: 20px;" />`
      : `<h1 style="color: #d97706; margin-bottom: 20px;">${config.fromName}</h1>`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BILL</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            ${logoHtml}
            <h2 style="color: white; margin: 0;">Order Confirmation</h2>
          </div>

          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${orderData.customerName || 'Customer'},</p>

            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your order! Your payment has been received successfully.</p>

            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #d97706;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Screen:</strong> ${orderData.screenName.toUpperCase()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems}
              </tbody>
              <tfoot>
                <tr style="background: #f9fafb; font-weight: bold;">
                  <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #e5e7eb;">Total Amount:</td>
                  <td style="padding: 15px; text-align: right; border-top: 2px solid #e5e7eb; color: #d97706; font-size: 18px;">₹${Number(orderData.total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #166534; font-weight: bold;">✓ Payment Confirmed</p>
              <p style="margin: 5px 0 0 0; color: #166534; font-size: 14px;">Your payment has been processed successfully.</p>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">If you have any questions about your order, please don't hesitate to contact us.</p>

            <p style="font-size: 16px; margin-top: 30px;">Thank you for choosing ${config.fromName}!</p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© ${new Date().getFullYear()} ${config.fromName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html,
    });
  }

  async testEmailConnection(id: string): Promise<any> {
    const config = await this.findConfigById(id);

    try {
      const transporter = await this.createTransporter(config);
      await transporter.verify();

      return {
        success: true,
        message: 'Email configuration is valid and connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}
