import { EZNotification } from '../entities/EZNotification.entity';

export class EZNotificationDto {
  EZNotificationData: Partial<EZNotification>;
  clerkCreatorId: string;
}
