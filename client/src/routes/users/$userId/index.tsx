import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { ErrorComponent } from "@/features/shared/components/ErrorComponent";
import { InfiniteScrolling } from "@/features/shared/components/infinteScrolling";
import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { UserEditDialog } from "@/features/users/components/UserEditDialog";
import { UserfollowButton } from "@/features/users/components/UserfollowButton";
import { UserForDetails } from "@/features/users/types";
import { isTRPCClientError, trpc } from "@/router";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { MartiniIcon } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/users/$userId/")({
  component: UserPage,
  params: {
    parse: (params) => ({
      userId: z.coerce.number().parse(params.userId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await trpcQueryUtils.users.byId.ensureData({
        id: params.userId,
      });
    } catch (error) {
      if (isTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
      throw error;
    }
  },
});

function UserPage() {
  const { userId } = Route.useParams();
  const [user] = trpc.users.byId.useSuspenseQuery({ id: userId });

  const experienceQuery = trpc.experiences.byUserId.useInfiniteQuery(
    {
      id: userId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  if (experienceQuery.isError) {
    return <ErrorComponent />;
  }
  return (
    <main className="space-y-4">
      <Card className="flex flex-col items-center gap-4 px-0">
        <UserAvatar user={user} showName={false} className="h-24 w-24" />
        <h1 className="text-3xl font-bold">{user.name}</h1>
        {user.bio && (
          <p className="text-neutral-600 dark:text-neutral-400">{user.bio}</p>
        )}
        <UserProfileButton user={user} />
        <UserProfileStats user={user} />
      </Card>

      <UserProfileHostStats user={user} />

      <h2 className="text-2xl font-bold">Experiences</h2>

      <InfiniteScrolling onLoadMore={experienceQuery.fetchNextPage}>
        <ExperienceList
          experience={
            experienceQuery.data?.pages.flatMap((page) => page.experiences) ??
            []
          }
          isLoading={
            experienceQuery.isLoading || experienceQuery.isFetchingNextPage
          }
        />
      </InfiniteScrolling>
    </main>
  );
}

type UserProfileStatsProps = {
  user: UserForDetails;
};

function UserProfileStats({ user }: UserProfileStatsProps) {
  const stats = [
    {
      label: "Followers",
      value: user.followersCount,
      to: "/users/$userId/follower",
      params: {
        userId: user.id,
      },
    },
    {
      label: "Following",
      value: user.followingCount,
      to: "/users/$userId/following",
      params: {
        userId: user.id,
      },
    },
  ] as const;

  return (
    <div className="flex w-full justify-center gap-12 border-y-2 border-neutral-200 py-4 dark:border-neutral-800">
      {stats.map((stat) => (
        <Link
          to={stat.to}
          key={stat.label}
          params={stat.params}
          variant="ghost"
          className="text-center"
        >
          <div className="dark:text-primary-500 text-secondary-500 text-center text-2xl font-bold">
            {stat.value}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {stat.label}
          </div>
        </Link>
      ))}
    </div>
  );
}

type UserProfileHostStatsProps = {
  user: UserForDetails;
};

function UserProfileHostStats({ user }: UserProfileHostStatsProps) {
  return (
    <Card className="space-y-2">
      <h3 className="text-center text-lg font-semibold">Text Stats</h3>
      <div className="flex flex-row items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400">
        <MartiniIcon className="h-5 w-5" />
        {user.hostedExperiencesCount}
      </div>
    </Card>
  );
}

type UserProfileButtonProps = {
  user: UserForDetails;
};

function UserProfileButton({ user }: UserProfileButtonProps) {
  const { currentUser } = useCurrentUser();
  const isCurrentUser = user.id === currentUser?.id;

  return isCurrentUser ? (
    <UserEditDialog user={user} />
  ) : (
    <UserfollowButton targetUserId={user.id} isFollowing={user.isFollowing} />
  );
}
