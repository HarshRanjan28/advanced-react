import { User } from "@advanced-react/server/database/schema";

type UserWithHostedExperiences = User & {
  hostedExperiencesCount: number;
};

type UserWithFollowCount = User & {
  followersCount: number;
  followingCount: number;
};

export type UserWithContext = User & {
  isFollowing: boolean;
};

export type UserForList = User & UserWithContext;

export type UserForDetails = UserWithHostedExperiences &
  UserWithFollowCount &
  UserWithContext;
