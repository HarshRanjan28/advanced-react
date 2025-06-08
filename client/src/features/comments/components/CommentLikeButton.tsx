import { Button } from "@/features/shared/components/ui/Button";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { Comment } from "@advanced-react/server/database/schema";
import { useParams } from "@tanstack/react-router";
import { Heart } from "lucide-react";

type CommentLikeButtonProps = {
  commentId: Comment["id"];
  isLiked: boolean;
  likesCount: number;
};

export function CommentLikeButton({
  commentId,
  isLiked,
  likesCount,
}: CommentLikeButtonProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { experienceId } = useParams({ strict: false });
  const likeMutation = trpc.comments.like.useMutation({
    onMutate: async ({ id }) => {
      if (!experienceId) return;
      await utils.comments.byExperienceId.cancel({ experienceId });

      const previousData = {
        comments: utils.comments.byExperienceId.getData({ experienceId }),
      };

      utils.comments.byExperienceId.setData({ experienceId }, (oldData) => {
        if (!oldData) return;

        return oldData.map((comment) =>
          comment.id === id
            ? { ...comment, isLiked: true, likesCount: comment.likesCount + 1 }
            : comment,
        );
      });
      return { previousData };
    },

    onError: (error, _, context) => {
      experienceId &&
        utils.comments.byExperienceId.setData(
          { experienceId },
          context?.previousData.comments,
        );

      toast({
        title: "Error updating likes",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unlikeMutation = trpc.comments.unlike.useMutation({
    onMutate: async ({ id }) => {
      if (!experienceId) return;

      await utils.comments.byExperienceId.cancel({ experienceId });

      const previousData = {
        comments: utils.comments.byExperienceId.getData({ experienceId }),
      };

      utils.comments.byExperienceId.setData({ experienceId }, (oldData) => {
        if (!oldData) return;

        return oldData.map((comment) =>
          comment.id === id
            ? {
                ...comment,
                isLiked: false,
                likesCount: Math.max(0, comment.likesCount - 1),
              }
            : comment,
        );
      });

      return { previousData };
    },

    onError: (error, _, context) => {
      experienceId &&
        utils.comments.byExperienceId.setData(
          { experienceId },
          context?.previousData.comments,
        );

      toast({
        title: "Error updating likes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Button
      variant="link"
      onClick={() =>
        isLiked
          ? unlikeMutation.mutate({ id: commentId })
          : likeMutation.mutate({ id: commentId })
      }
      disabled={unlikeMutation.isPending || likeMutation.isPending}
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
      />
      {likesCount}
    </Button>
  );
}
