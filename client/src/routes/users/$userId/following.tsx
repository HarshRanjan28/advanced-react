import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { UserfollowButton } from "@/features/users/components/UserfollowButton";
import { UserList } from "@/features/users/components/UserList";
import { isTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/users/$userId/following")({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  component: UserfollowingPage,
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await trpcQueryUtils.users.following.prefetchInfinite({
        id: params.userId,
      });
    } catch (err) {
      if (isTRPCClientError(err) && err.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw err;
    }
  },
});

function UserfollowingPage() {
  const { userId } = Route.useParams();
  const [{ pages }, followingQuery] =
    trpc.users.following.useSuspenseInfiniteQuery(
      { id: userId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const totalFollowing = pages[0].followingCount;
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Following {totalFollowing}</h1>
      <InfiniteScrolling onLoadMore={followingQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={followingQuery.isFetchingNextPage}
          rightComponent={(user) => (
            <UserfollowButton
              targetUserId={user.id}
              isFollowing={user.isFollowing}
            />
          )}
        />
      </InfiniteScrolling>
    </main>
  );
}
