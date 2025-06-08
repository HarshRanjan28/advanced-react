import Card from "@/features/shared/components/ui/Card";
import { LinkIcon } from "lucide-react";
import { ExerienceForDetail } from "../types";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Link from "@/features/shared/components/ui/Link";
import { ExperienceDeleteDialog } from "./ExperienceDeleteDialog";
import { router } from "@/router";
import { ExperienceAttendButton } from "./ExperienceAttendButton";
import { UserAvatarList } from "@/features/users/components/UserAvatarList";
import { ExperienceFavoritesButton } from "./ExperienceFavoritesButton";
import { TagList } from "@/features/tag/components/TagList";
import { LocationData } from "@advanced-react/shared/schema/experience";
import { LocationDisplay } from "@/features/shared/components/LocationDisplay";

type ExperienceDetailsProps = {
  experience: ExerienceForDetail;
};

export function ExperienceDetails({ experience }: ExperienceDetailsProps) {
  return (
    <Card className="p-0">
      <ExperienceDetailsMedia experience={experience} />
      <div className="space-y-4 p-4">
        <ExperienceDetailsHeader experience={experience} />
        <ExperienceDetailsContent experience={experience} />
        <ExperienceDetailsMeta experience={experience} />
        <ExperienceAttendees experience={experience} />
        <ExperienceCardTags experience={experience} />
        <ExperienceCardActionButtons experience={experience} />
        <ExperienceDetailLocation experience={experience} />
      </div>
    </Card>
  );
}

type ExperienceDetailsMediaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMedia({ experience }: ExperienceDetailsMediaProps) {
  if (!experience.imageUrl) {
    return null;
  }
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

type ExperienceDetailsHeaderProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsHeader({ experience }: ExperienceDetailsHeaderProps) {
  return <h1 className="text-2xl font-bold">{experience.title}</h1>;
}

type ExperienceDetailsContentProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsContent({
  experience,
}: ExperienceDetailsContentProps) {
  return (
    <p className="text-lg text-neutral-600 dark:text-neutral-400">
      {experience.content}
    </p>
  );
}

type ExperienceDetailsMetaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMeta({ experience }: ExperienceDetailsMetaProps) {
  return (
    <div className="items-cenetr flex gap-4 text-neutral-600 dark:text-neutral-400">
      <time>{new Date(experience.scheduledAt).toLocaleString()}</time>
      {experience.url && (
        <div className="flex items-center gap-2">
          <LinkIcon
            size={16}
            className="text-secondary-500 dark:text-primary-500"
          />
          <a
            href={experience?.url}
            target="__blank"
            className="text-secondary-500 dark:text-primary-500 hover:underline"
          >
            Events Details
          </a>
        </div>
      )}
    </div>
  );
}

type ExperienceAttendeesProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceAttendees({ experience }: ExperienceAttendeesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Host</h3>
        <UserAvatarList users={[experience.user]} totalCount={1} />
      </div>

      <div className="space-y-2">
        <Link
          to="/experiences/$experienceId/Attendees"
          params={{ experienceId: experience.id }}
          variant="secondary"
        >
          <h3 className="font-medium">Attendess {experience.attendeesCount}</h3>
        </Link>

        {experience.attendeesCount > 0 ? (
          <UserAvatarList
            users={experience.attendees}
            totalCount={experience.attendeesCount}
          />
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">
            Be the first to attend!
          </p>
        )}
      </div>
    </div>
  );
}

type ExperienceCardTagsProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceCardTags({ experience }: ExperienceCardTagsProps) {
  return <TagList tags={experience.tags} />;
}

type ExperiencecardActionButtonProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceCardActionButtons({
  experience,
}: ExperiencecardActionButtonProps) {
  const { currentUser } = useCurrentUser();

  const isPostOwner = currentUser?.id === experience.userId;
  if (isPostOwner) {
    return <ExperienceCardOwnerButton experience={experience} />;
  }
  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <ExperienceAttendButton
          experienceId={experience.id}
          isAttending={experience.isAttending}
        />
        <ExperienceFavoritesButton
          experienceId={experience.id}
          isFavorited={experience.isFavorited}
          favoritesCount={experience.favoritesCount}
        />
      </div>
    );
  }
  return null;
}

type ExperienceCardOwnerButtonProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceCardOwnerButton({
  experience,
}: ExperienceCardOwnerButtonProps) {
  return (
    <div className="flex gap-4">
      <Button asChild variant="ghost">
        <Link
          to="/experiences/$experienceId/edit"
          params={{ experienceId: experience.id }}
        >
          Edit Profile
        </Link>
      </Button>
      <ExperienceDeleteDialog
        experience={experience}
        onSuccess={() => {
          router.navigate({ to: "/" });
        }}
      />
    </div>
  );
}

type ExperienceDetailLocationProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailLocation({
  experience,
}: ExperienceDetailLocationProps) {
  const location = experience.location
    ? (JSON.parse(experience.location) as LocationData)
    : null;

  if (!location) return null;

  return <LocationDisplay location={location} />;
}
