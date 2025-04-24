// src/calendar/entities/calendar-event.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('calendar_event')
@Index(['userId', 'date'], { unique: true })   // ідемпотентність
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'date' })
  date: string;               // YYYY-MM-DD

  @Column()
  title: string;

  @Column()
  countryCode: string;
}
