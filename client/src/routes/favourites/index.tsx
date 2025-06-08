import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { trpc } from "@/router";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/favourites/")({
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }

    await trpcQueryUtils.experiences.favorites.prefetchInfinite({});
  },
  component: FavouritesPage,
});

function FavouritesPage() {
  const [{ pages }, favoritesQuery] =
    trpc.experiences.favorites.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  return (
    <main className="space-y-4">
      <InfiniteScrolling onLoadMore={favoritesQuery.fetchNextPage}>
        <ExperienceList
          experience={pages.flatMap((page) => page.experiences)}
          isLoading={favoritesQuery.isLoading}
        />
      </InfiniteScrolling>
    </main>
  );
}
