import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { trpc } from "@/router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context: { trpcQueryUtils } }) => {
    // basically we are prefetching the data in the queryClient and make a shared cache
    //  and then we can use it in the component
    await trpcQueryUtils.experiences.feed.prefetchInfinite({});
  },
});

function Index() {
  const [{ pages }, experienceQuery] =
    trpc.experiences.feed.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <InfiniteScrolling onLoadMore={experienceQuery.fetchNextPage}>
      <ExperienceList
        experience={pages.flatMap((page) => page.experiences)}
        isLoading={experienceQuery.isFetchingNextPage}
      />
    </InfiniteScrolling>
  );
}
