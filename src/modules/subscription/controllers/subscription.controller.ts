import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSubscriptionDTO } from '../dtos/create-subscription.dto';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionAction } from '../enum/subscription.enum';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  async createSubscription(@Body() subscription: CreateSubscriptionDTO) {
    const existingSubscription =
      await this.subscriptionService.create(subscription)
    return existingSubscription;
  }

  @Get('confirm/:token')
  async confirmSubscription(@Param('token') token: string) {
    await this.subscriptionService.manageSubscription(
      token,
      SubscriptionAction.CONFIRM,
    );
    return { success: true };
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string) {
    await this.subscriptionService.manageSubscription(
      token,
      SubscriptionAction.UNSUBSCRIBE,
    );
    return { success: true };
  }
}
