import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';
import { Addon } from '../../entities/addon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Addon])],
  controllers: [AddonsController],
  providers: [AddonsService],
  exports: [AddonsService],
})
export class AddonsModule {}
