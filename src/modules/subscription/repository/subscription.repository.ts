import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../entity/subscription.entity';

export class SubscriptionRepository extends Repository<Subscription> {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {
    super(
      subscriptionRepository.target,
      subscriptionRepository.manager,
      subscriptionRepository.queryRunner,
    );
  }

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const newSubscription = this.create(data);
    return this.save(newSubscription);
  }

  async getSubscriptionEmailCity(email: string, city: string) {
    return this.findOne({ where: { email, city } });
  }
}
