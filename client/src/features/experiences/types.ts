import { Experience, Tag, User } from "@advanced-react/server/database/schema";

type ExperinceWithUser = Experience & {
  user: User;
};

type ExperienceWithCommentCount = Experience & {
  commentsCount: number;
};

type ExperienceWithUserContext = Experience & {
  isAttending: boolean;
  isFavorited: boolean;
};

type ExperienceWithFavoritesCount = Experience & {
  favoritesCount: number;
};

type ExperienceWithAttendeesCount = Experience & {
  attendeesCount: number;
};

type ExperienceWithAttendees = Experience & {
  attendees: User[];
};

type ExperienceWithTags = Experience & {
  tags: Tag[];
};

export type ExperienceForList = ExperinceWithUser &
  ExperienceWithUserContext &
  ExperienceWithCommentCount &
  ExperienceWithAttendeesCount &
  ExperienceWithFavoritesCount &
  ExperienceWithTags;

export type ExerienceForDetail = ExperinceWithUser &
  ExperienceWithUserContext &
  ExperienceWithCommentCount &
  ExperienceWithAttendeesCount &
  ExperienceWithAttendees &
  ExperienceWithFavoritesCount &
  ExperienceWithTags;
