import { NotificationsList } from "@/features/notifications/components/notification";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { trpc } from "@/router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/notifications/")({
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }

    await trpcQueryUtils.notifications.feed.prefetchInfinite({});
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  const [{ pages }, notificationsQuery] =
    trpc.notifications.feed.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  return (
    <main className="space-y-4">
      <InfiniteScrolling onLoadMore={notificationsQuery.fetchNextPage}>
        <NotificationsList
          notifications={pages.flatMap((page) => page.notifications)}
          isLoading={notificationsQuery.isFetchingNextPage}
        />
      </InfiniteScrolling>
    </main>
  );
}
