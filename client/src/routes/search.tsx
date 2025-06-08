import { ExperienceFilter } from "@/features/experiences/components/ExperienceFilters";
import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { trpc } from "@/router";
import { experienceFiltersSchema } from "@advanced-react/shared/schema/experience";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: experienceFiltersSchema,
});

function SearchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const experienceQuery = trpc.experiences.search.useInfiniteQuery(search, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!search.q || !!search.tags,
  });
  const [tags] = trpc.tags.list.useSuspenseQuery();
  return (
    <main className="space-y-4">
      <ExperienceFilter
        onFilterChange={(filters) => {
          navigate({ search: filters });
        }}
        initialfilters={search}
        tags={tags}
      />
      <InfiniteScrolling onLoadMore={!!search.q ? experienceQuery.fetchNextPage: undefined}>
        <ExperienceList
          experience={
            experienceQuery.data?.pages.flatMap((page) => page.experiences) ??
            []
          }
          isLoading={experienceQuery.isLoading || experienceQuery.isFetching}
          noExperienceMessage={
            !!search.q
              ? "No Experience Found"
              : "Search to find the experiences"
          }
        />
      </InfiniteScrolling>
    </main>
  );
}
