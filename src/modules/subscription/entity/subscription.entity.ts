import { BaseEntity } from '../../../common/base.entity';
import { Entity, Column, Unique } from 'typeorm';
import { Frequency } from '../enum/frequency.enum';

@Entity('Subscription')
@Unique(['email', 'city'])
export class Subscription extends BaseEntity {
  @Column()
  email: string;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: Frequency, default: Frequency.HOURLY })
  frequency: string;

  @Column({ default: false })
  confirmed: boolean;

  @Column()
  confirmationToken: string;

  @Column({ nullable: true })
  unsubscribeToken: string;
}
