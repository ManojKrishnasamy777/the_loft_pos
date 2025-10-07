import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreensService } from './screens.service';
import { ScreensController } from './screens.controller';
import { Screens } from '@/entities/screens.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Screens])],
    controllers: [ScreensController],
    providers: [ScreensService],
    exports: [ScreensService],
})
export class ScreensModule { }
