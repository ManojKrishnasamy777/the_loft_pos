import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailConfigDto } from './dto/create-email-config.dto';
import { UpdateEmailConfigDto } from './dto/update-email-config.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('config')
  async createConfig(@Body() createDto: CreateEmailConfigDto) {
    return await this.emailService.createConfig(createDto);
  }

  @Get('config')
  async getAllConfigs() {
    return await this.emailService.findAllConfigs();
  }

  @Get('config/active')
  async getActiveConfig() {
    return await this.emailService.getActiveConfig();
  }

  @Get('config/:id')
  async getConfigById(@Param('id') id: string) {
    return await this.emailService.findConfigById(id);
  }

  @Put('config/:id')
  async updateConfig(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailConfigDto,
  ) {
    return await this.emailService.updateConfig(id, updateDto);
  }

  @Delete('config/:id')
  async deleteConfig(@Param('id') id: string) {
    await this.emailService.deleteConfig(id);
    return { message: 'Email configuration deleted successfully' };
  }

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return await this.emailService.sendEmail(sendEmailDto);
  }

  @Post('send-order-confirmation')
  async sendOrderConfirmation(
    @Body() body: { orderData: any; customerEmail: string },
  ) {
    return await this.emailService.sendOrderConfirmation(
      body.orderData,
      body.customerEmail,
    );
  }

  @Post('test/:id')
  async testConnection(@Param('id') id: string) {
    return await this.emailService.testEmailConnection(id);
  }
}
