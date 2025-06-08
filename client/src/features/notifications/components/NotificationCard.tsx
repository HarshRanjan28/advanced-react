import { LinkProps } from "@tanstack/react-router";
import { NotificationForLists } from "../types";
import Link from "@/features/shared/components/ui/Link";
import Card from "@/features/shared/components/ui/Card";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";

type NotificationCardProps = {
  notification: NotificationForLists;
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  let linkProps: Pick<LinkProps, "to" | "params"> | undefined;

  const markRead = trpc.notifications.markAsRead.useMutation({
    onMutate: async () => {
      await Promise.all([
        utils.notifications.feed.cancel(),
        utils.notifications.unreadCount.cancel(),
      ]);

      const previousData = {
        feed: utils.notifications.feed.getInfiniteData(),
        unreadCount: utils.notifications.unreadCount.getData(),
      };

      utils.notifications.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === notification.id ? { ...n, read: true } : n,
            ),
          })),
        };
      });

      utils.notifications.unreadCount.setData(undefined, (oldData) => {
        if (!oldData) return;

        return Math.max(oldData - 1, 0);
      });

      return {
        previousData,
      };
    },

    onError: (error, _, context) => {
      utils.notifications.feed.setInfiniteData({}, context?.previousData.feed);
      utils.notifications.unreadCount.setData(
        undefined,
        context?.previousData.unreadCount,
      );
      toast({
        title: "Error marking as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (
    [
      "user_attending_experience",
      "user_unattending_experience",
      "user_commented_experience",
    ].includes(notification.type) &&
    notification.experienceId
  ) {
    linkProps = {
      to: "/experiences/$experienceId",
      params: { experienceId: notification.experienceId },
    };
  } else if (notification.type === "user_followed_user") {
    linkProps = {
      to: "/users/$userId",
      params: { userId: notification.fromUserId },
    };
  }

  return (
    <Link
      {...linkProps}
      variant="ghost"
      onClick={() =>
        !notification.read && markRead.mutate({ id: notification.id })
      }
    >
      <Card className="flex w-full items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <div>
          <p className="text-gray-800 dark:text-gray-200">
            {notification.content}
          </p>
          <p className="text-cm text-gray-500">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-red-500" />
        )}
      </Card>
    </Link>
  );
}
