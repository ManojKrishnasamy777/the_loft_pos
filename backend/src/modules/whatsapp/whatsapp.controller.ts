import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { SendBulkMessageDto } from './dto/send-bulk-message.dto';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('templates')
  async getTemplates() {
    const templates = await this.whatsappService.getAvailableTemplates();
    return {
      success: true,
      templates,
    };
  }

  @Post('send')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const result = await this.whatsappService.sendTemplateMessage(
      sendMessageDto.phone,
      sendMessageDto.templateName,
      sendMessageDto.languageCode || 'en',
      sendMessageDto.parameters,
    );

    return {
      success: true,
      message: 'WhatsApp message sent successfully',
      data: result,
    };
  }

  @Post('send-bulk')
  async sendBulkMessages(@Body() sendBulkMessageDto: SendBulkMessageDto) {
    const result = await this.whatsappService.sendBulkMessages(
      sendBulkMessageDto.recipients,
      sendBulkMessageDto.templateName,
      sendBulkMessageDto.languageCode || 'en',
    );

    return {
      success: true,
      message: 'Bulk WhatsApp messages processed',
      data: result,
    };
  }

  @Post('send-bulk-csv')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        templateName: {
          type: 'string',
        },
        languageCode: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async sendBulkFromCSV(
    @UploadedFile() file: Express.Multer.File,
    @Body('templateName') templateName: string,
    @Body('languageCode') languageCode?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No CSV file uploaded');
    }

    if (!templateName) {
      throw new BadRequestException('Template name is required');
    }

    const fileContent = file.buffer.toString('utf-8');
    const recipients = await this.whatsappService.parseCSV(fileContent);

    if (recipients.length === 0) {
      throw new BadRequestException('No valid recipients found in CSV file');
    }

    const result = await this.whatsappService.sendBulkMessages(
      recipients,
      templateName,
      languageCode || 'en',
    );

    return {
      success: true,
      message: 'Bulk WhatsApp messages from CSV processed',
      data: result,
    };
  }

  @Post('send-bulk-excel')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        templateName: {
          type: 'string',
        },
        languageCode: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async sendBulkFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('templateName') templateName: string,
    @Body('languageCode') languageCode?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No Excel file uploaded');
    }

    if (!templateName) {
      throw new BadRequestException('Template name is required');
    }

    const fileContent = file.buffer.toString('utf-8');
    const recipients = await this.whatsappService.parseCSV(fileContent);

    if (recipients.length === 0) {
      throw new BadRequestException('No valid recipients found in file');
    }

    const result = await this.whatsappService.sendBulkMessages(
      recipients,
      templateName,
      languageCode || 'en',
    );

    return {
      success: true,
      message: 'Bulk WhatsApp messages from Excel processed',
      data: result,
    };
  }
}
