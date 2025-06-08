import { Notification } from "@advanced-react/server/database/schema";

type NotiicationWithContent = Notification & {
  content: string;
};

export type NotificationForLists = NotiicationWithContent;
