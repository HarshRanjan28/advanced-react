import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ExperienceKickButton } from "@/features/experiences/components/ExperienceKickButton";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import { UserfollowButton } from "@/features/users/components/UserfollowButton";
import { UserList } from "@/features/users/components/UserList";
import { isTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/experiences/$experienceId/Attendees")({
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  component: ExperienceAttendeesPage,
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.experiences.byId.ensureData({
          id: params.experienceId,
        }),
        trpcQueryUtils.users.experienceAttendees.prefetchInfinite({
          experienceId: params.experienceId,
        }),
      ]);
    } catch (err) {
      if (isTRPCClientError(err) && err.data?.code === "NOT_FOUND") {
        throw notFound();
      }
    }
  },
});

function ExperienceAttendeesPage() {
  const { experienceId } = Route.useParams();
  const { currentUser } = useCurrentUser();
  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });
  const [{ pages }, attendeesQuery] =
    trpc.users.experienceAttendees.useSuspenseInfiniteQuery(
      {
        experienceId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const totalAttendees = pages[0].attendeesCount;

  const isOwner = currentUser?.id === experience.userId;
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Attendees for "{experience.title}"</h1>
      <div className="space-y-4">
        <h2 className="font-medium">Attendees {totalAttendees}</h2>
        <InfiniteScrolling onLoadMore={attendeesQuery.fetchNextPage}>
          <UserList
            users={pages.flatMap((page) => page.attendees)}
            isLoading={attendeesQuery.isFetchingNextPage}
            rightComponent={(user) => (
              <div className="flex gap-4">
                <UserfollowButton
                  targetUserId={user.id}
                  isFollowing={user.isFollowing} />
                {isOwner && (
                  <ExperienceKickButton
                    experienceId={experienceId}
                    userId={user.id} />
                )}
              </div>
            )}          />
        </InfiniteScrolling>
      </div>
    </main>
  );
}
