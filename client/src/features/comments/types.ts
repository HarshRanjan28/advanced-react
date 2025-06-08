import {
  Comment,
  Experience,
  User,
} from "@advanced-react/server/database/schema";

type CommentWithUser = Comment & {
  user: User;
};

type CommentWithExperience = Comment & {
  experience: Experience;
};

type CommentWithUserContext = Comment & {
  isLiked: boolean;
};

type CommentWithLikesCount = Comment & {
  likesCount: number;
};

export type CommentForList = CommentWithUser &
  CommentWithExperience &
  CommentWithUserContext &
  CommentWithLikesCount;

export type OptimisticComment = CommentWithUser &
  CommentWithExperience & {
    optimistic: true;
    likesCount:number;
    isLiked:boolean
  };
