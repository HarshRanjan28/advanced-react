import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { isTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/tags/$tagId")({
  params: {
    parse: (params) => ({
      tagId: z.coerce.number().parse(params.tagId),
    }),
  },
  component: TagsPage,
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.tags.byId.ensureData({ id: params.tagId }),
        trpcQueryUtils.experiences.byTagId.prefetchInfinite({
          id: params.tagId,
        }),
      ]);
    } catch (err) {
      if (isTRPCClientError(err) && err.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw err;
    }
  },
});

function TagsPage() {
  const { tagId } = Route.useParams();
  const [tag] = trpc.tags.byId.useSuspenseQuery({ id: tagId });
  const [{ pages }, experienceQuery] =
    trpc.experiences.byTagId.useSuspenseInfiniteQuery(
      { id: tagId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">{tag.name}</h2>
      <InfiniteScrolling onLoadMore={experienceQuery.fetchNextPage}>
        <ExperienceList
          experience={pages.flatMap((page) => page.experiences)}
          isLoading={experienceQuery.isLoading}
        ></ExperienceList>
      </InfiniteScrolling>
    </main>
  );
}
