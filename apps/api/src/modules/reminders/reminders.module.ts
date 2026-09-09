import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { FamiliesModule } from '../families/families.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { LearnersModule } from '../learners/learners.module.js';
import { ReportsModule } from '../reports/reports.module.js';
import { ReminderSchedulerService } from './application/reminder-scheduler.service.js';

@Module({
  imports: [ScheduleModule.forRoot(), FamiliesModule, SettingsModule, LearnersModule, ReportsModule],
  providers: [ReminderSchedulerService],
})
export class RemindersModule {}
