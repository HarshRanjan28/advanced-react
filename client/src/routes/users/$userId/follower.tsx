import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { UserfollowButton } from "@/features/users/components/UserfollowButton";
import { UserList } from "@/features/users/components/UserList";
import { isTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/users/$userId/follower")({
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  component: UserfollowerPage,
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await trpcQueryUtils.users.followers.prefetchInfinite({
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

function UserfollowerPage() {
  const { userId } = Route.useParams();
  const [{ pages }, followersQuery] =
    trpc.users.followers.useSuspenseInfiniteQuery(
      { id: userId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  const totalFollowers = pages[0].followersCount;
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Followers ({totalFollowers})</h1>
      <InfiniteScrolling onLoadMore={followersQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={followersQuery.isFetchingNextPage}
          rightComponent={(user)=>(
            <UserfollowButton targetUserId={user.id} isFollowing={user.isFollowing}/>
          )}
        />
      </InfiniteScrolling>
    </main>
  );
}
