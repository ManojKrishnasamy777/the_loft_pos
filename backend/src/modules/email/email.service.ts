import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as PDFDocument from 'pdfkit';
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

  async sendEmail(sendEmailDto: SendEmailDto, attachments?: any[]): Promise<any> {
    const config = await this.getActiveConfig();
    console.log('Active email config:', config);

    if (!config) {
      throw new Error('No active email configuration found');
    }

    const transporter = await this.createTransporter(config);

    const mailOptions: any = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      text: sendEmailDto.text,
      html: sendEmailDto.html,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

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

    const addonsRows = orderData.addons && orderData.addons.length > 0
      ? orderData.addons
        .map(
          (addon: any) =>
            `<tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${addon.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">1</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(addon.price).toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(addon.price).toFixed(2)}</td>
              </tr>`,
        )
        .join('')
      : '';

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
          <div style="background: linear-gradient(to right, #CE2029, #ff6b6b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
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
                ${addonsRows}
              </tbody>
              <tfoot>
                <tr style="background: #f3f4f6;">
                  <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
                  <td style="padding: 10px; text-align: right;">₹${Number(orderData.subtotal).toFixed(2)}</td>
                </tr>
                ${orderData.addonsTotal > 0 ? `<tr style="background: #f3f4f6;">
                  <td colspan="3" style="padding: 10px; text-align: right;">Add-ons Total:</td>
                  <td style="padding: 10px; text-align: right;">₹${Number(orderData.addonsTotal).toFixed(2)}</td>
                </tr>` : ''}
                <tr style="background: #f3f4f6;">
                  <td colspan="3" style="padding: 10px; text-align: right;">Tax:</td>
                  <td style="padding: 10px; text-align: right;">₹${Number(orderData.taxAmount).toFixed(2)}</td>
                </tr>
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

    const pdfBuffer = await this.generateInvoicePDF(orderData, config);

    return await this.sendEmail(
      {
        to: customerEmail,
        subject: `BILL - ${orderData.orderNumber}`,
        html,
      },
      [
        {
          filename: `Invoice-${orderData.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    );
  }
  async generateInvoicePDF(orderData: any, config: EmailConfig): Promise<Buffer> {
    const CURRENCY_SYMBOL = '₹'; // Define the symbol for easy changes
    const LOGO_PATH = 'assets/logob.png'; // ⚠️ IMPORTANT: UPDATE WITH YOUR LOGO PATH
    const LOGO_WIDTH = 250; // Set a fixed width for the logo
    const PADDING = 50; // Use the defined PADDING for consistency

    // ⭐ ADJUSTED FIX: Manual correction factor.
    // Use a positive number (e.g., 0.025) and ADD it to logoY to shift DOWN.
    const WATERMARK_VERTICAL_OFFSET = 0.055;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: PADDING });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- 1. Load Custom Font (CRITICAL for ₹ symbol) ---
      try {
        doc.font('assets/fonts/Poppins-Regular.ttf');
      } catch (error) {
        console.warn(`Font loading failed: ${error.message}. Falling back to default font. Currency symbol '₹' may not render correctly.`);
        doc.font('Helvetica'); // Fallback to a safe default
      }


      // --- 2. Header and Title ---
      doc.fontSize(24)
        .fillColor('#333333')
        .text(config.fromName.toUpperCase(), PADDING, PADDING, { bold: true });

      doc.fontSize(12)
        .fillColor('#666666')
        .text('Invoice for Order', PADDING, PADDING + 30);

      doc.fontSize(30)
        .fillColor('#004D99') // Deep Blue for highlight
        .text('INVOICE', 0, PADDING, { align: 'right' });

      doc.moveDown(2);

      // --- 7. Watermark Logo (MODIFIED FOR DOWNWARD SHIFT) ---
      try {
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;

        const logoHeight = LOGO_WIDTH;

        // Calculate center position
        const logoX = (pageWidth / 2) - (LOGO_WIDTH / 2);
        let logoY = (pageHeight / 2) - (logoHeight / 2);

        // ⭐ APPLY THE FIX: Add a percentage of the page height to Y to shift the image DOWN.
        logoY += (pageHeight * WATERMARK_VERTICAL_OFFSET);

        doc.opacity(0.1); // Set opacity for watermark effect
        doc.image(LOGO_PATH, logoX, logoY, {
          width: LOGO_WIDTH,
        });
        doc.opacity(1); // Reset opacity for all subsequent elements (CRITICAL)
      } catch (error) {
        console.warn(`Could not load logo for watermark: ${error.message}. Watermark skipped.`);
      }
      // -----------------------------


      // --- 3. Invoice & Customer Details Block ---
      const detailY = doc.y;
      const col1X = PADDING;
      const col2X = 350;

      // Draw a separator line
      doc.strokeColor('#CCCCCC')
        .lineWidth(1)
        .moveTo(PADDING, detailY - 10)
        .lineTo(doc.page.width - PADDING, detailY - 10)
        .stroke();

      doc.fontSize(10).fillColor('#333333');

      // Left Column (Customer Details)
      doc.text('BILL TO:', col1X, detailY);
      doc.text(orderData.customerName || 'Guest', col1X, detailY + 15, { bold: true });
      // Add customer address if available
      doc.moveDown(0.5);

      // Right Column (Invoice Details)
      doc.text('Invoice No:', col2X, detailY, { bold: true });
      doc.text(orderData.orderNumber, col2X + 70, detailY);

      doc.text('Date:', col2X, detailY + 15, { bold: true });
      doc.text(new Date(orderData.createdAt).toLocaleDateString(), col2X + 70, detailY + 15);

      doc.text('Payment:', col2X, detailY + 30, { bold: true });
      doc.text(orderData.paymentMethod.toUpperCase(), col2X + 70, detailY + 30);

      if (orderData.screenName || orderData?.screen?.name) {
        doc.text('Screen:', col2X, detailY + 45, { bold: true });
        doc.text(orderData.screenName || orderData?.screen?.name, col2X + 70, detailY + 45);
      }

      doc.moveDown(4); // Move down past the detail section

      // --- 4. Items Table Header ---
      const tableTop = doc.y;
      const itemX = PADDING;
      const qtyX = 350;
      const priceX = 400;
      const totalX = doc.page.width - PADDING - 70; // Adjusted for right-alignment

      // Header Background
      doc.rect(PADDING, tableTop - 5, doc.page.width - (2 * PADDING), 20)
        .fill('#F0F0F0'); // Light grey background

      doc.fontSize(10).fillColor('#333333');
      doc.text('ITEM DESCRIPTION', itemX, tableTop, { bold: true });
      doc.text('QTY', qtyX, tableTop, { width: 40, align: 'right', bold: true });
      doc.text('PRICE', priceX, tableTop, { width: 70, align: 'right', bold: true });
      doc.text('TOTAL', totalX, tableTop, { width: 70, align: 'right', bold: true });

      let y = tableTop + 25;
      const rowHeight = 20;
      doc.fillColor('#000000'); // Black for item text

      // --- 5. Line Items ---
      const renderItems = (items: any[]) => {
        items.forEach((item: any) => {
          doc.text(item.name, itemX, y, { width: 300 });
          doc.text(item.quantity?.toString() || '1', qtyX, y, { width: 40, align: 'right' });

          const price = Number(item.price);
          const itemTotal = item.quantity ? price * item.quantity : price;

          doc.text(`${CURRENCY_SYMBOL}${price.toFixed(2)}`, priceX, y, { width: 70, align: 'right' });
          doc.text(`${CURRENCY_SYMBOL}${itemTotal.toFixed(2)}`, totalX, y, { width: 70, align: 'right' });
          y += rowHeight;
        });
      };

      // Render main items
      renderItems(orderData.items);

      // Render add-ons (if any)
      if (orderData.addons && orderData.addons.length > 0) {
        doc.moveDown(1);
        doc.fontSize(10).text('ADD-ONS', itemX, y, { underline: true });
        y += rowHeight;

        renderItems(orderData.addons.map((addon: any) => ({ ...addon, quantity: 1 })));

        // Add extra space before the final line
        y += 10;  // 10 units of space (adjust as needed)
      }

      // Final line after all items
      doc.strokeColor('#DDDDDD')
        .lineWidth(1)
        .moveTo(PADDING, y - rowHeight + 10)
        .lineTo(doc.page.width - PADDING, y - rowHeight + 10)
        .stroke();


      // --- 6. Summary Totals ---
      y = y + 20;
      const labelX = 400;
      const valueX = totalX; // Align values to the right

      const renderSummaryRow = (label: string, value: number, isTotal = false) => {
        doc.fontSize(isTotal ? 12 : 10).fillColor('#333333');
        doc.text(label, labelX, y, { width: 70, align: 'right', bold: isTotal });
        doc.text(`${CURRENCY_SYMBOL}${Number(value).toFixed(2)}`, valueX, y, { width: 70, align: 'right', bold: isTotal });
        y += isTotal ? 25 : 15;
      };

      renderSummaryRow('Subtotal:', orderData.subtotal);
      if (orderData.addonsTotal > 0) {
        renderSummaryRow('Add-ons:', orderData.addonsTotal);
      }
      // Render Tax row
      renderSummaryRow('Tax:', orderData.taxAmount);

      // Add space between Tax and Total
      y += 10;  // 10 units of bottom space (adjust as needed)

      // Total Row Highlight
      doc.rect(labelX - 10, y - 5, doc.page.width - labelX - PADDING + 80, 25)
        .fill('#E6F0FF'); // Light blue background for total

      // Render Total row
      renderSummaryRow('TOTAL:', orderData.total, true);

      // // Move y below the total row for next content
      // y += 25; // height of total row

      // --- 8. Responsive Footer ---
      // Set the Y position relative to the bottom of the page (doc.page.height - PADDING)
      // doc.fontSize(10)
      //   .fillColor('#666666')
      //   .text('Thank you visit again.', 0, doc.page.height - PADDING, {
      //     align: 'center'
      //   });

      doc.end();
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
