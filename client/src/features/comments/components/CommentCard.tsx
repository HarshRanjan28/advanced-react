import Card from "@/features/shared/components/ui/Card";
import { CommentForList, OptimisticComment } from "../types";
import { useState } from "react";
import { EditCommentForm } from "./EditComment";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
} from "@/features/shared/components/ui/Dialog";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import Link from "@/features/shared/components/ui/Link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CommentLikeButton } from "./CommentLikeButton";

type CommentCardProps = {
  comment: CommentForList;
};

export function CommentCard({ comment }: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditCommentForm comment={comment} setIsEditing={setIsEditing} />;
  }

  return (
    <Card className="space-y-4">
      <CommentCardHeader comment={comment} />
      <CommentCardContent comment={comment} />
      <CommentCardMetricButton comment={comment} />
      <CommentCardButtons setIsEditing={setIsEditing} comment={comment} />
    </Card>
  );
}

type CommentCardHeaderProps = Pick<CommentCardProps, "comment">;

export function CommentCardHeader({ comment }: CommentCardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Link to="/users/$userId" params={{ userId: comment.user.id }}>
        <UserAvatar user={comment.user} />
      </Link>
      <time>{new Date(comment.createdAt).toLocaleDateString()}</time>
    </div>
  );
}

type CommentCardContentProps = Pick<CommentCardProps, "comment">;

export function CommentCardContent({ comment }: CommentCardContentProps) {
  return <p>{comment.content}</p>;
}
type CommentCardMetricButtonProps = Pick<CommentCardProps, "comment">;

function CommentCardMetricButton({ comment }: CommentCardMetricButtonProps) {
  return (
    <CommentLikeButton
      commentId={comment.id}
      isLiked={comment.isLiked}
      likesCount={comment.likesCount}
    />
  );
}

type CommentCardButtonsProps = Pick<CommentCardProps, "comment"> & {
  setIsEditing: (value: boolean) => void;
};

function CommentCardButtons({
  setIsEditing,
  comment,
}: CommentCardButtonsProps) {
  const { currentUser } = useCurrentUser();
  const isCommentOwner = currentUser?.id === comment.userId;
  const isExperienceOwner = currentUser?.id === comment.experience.userId;

  if (!isCommentOwner || !isExperienceOwner) {
    return null;
  }

  const utils = trpc.useUtils();
  const { toast } = useToast();
  const deleteMutation = trpc.comments.delete.useMutation({
    onMutate: async ({ id }) => {
      await Promise.all([
        utils.comments.byExperienceId.cancel({
          experienceId: comment.experienceId,
        }),
        utils.experiences.byId.cancel({ id: comment.experienceId }),
      ]);
      setIsDeleteDialogOpen(false);

      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId: comment.experienceId,
        }),
        byId: utils.experiences.byId.getData({ id: comment.experienceId }),
      };

      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        (oldData) => {
          if (!oldData) return;

          return oldData.filter((comment) => comment.id !== id);
        },
      );

      utils.experiences.byId.setData(
        { id: comment.experienceId },
        (oldData) => {
          if (!oldData) return;

          return {
            ...oldData,
            commentsCount: Math.max(0, oldData.commentsCount - 1),
          };
        },
      );

      const { dismiss } = toast({
        title: "Deleted Comment Successfully",
        description: "Your Comment has been deleted",
      });

      return { previousData, dismiss };
    },
    onError: (error, _, context) => {
      context?.dismiss;

      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        context?.previousData.byExperienceId,
      );
      utils.experiences.byId.setData(
        { id: comment.experienceId },
        context?.previousData.byId,
      );

      toast({
        title: "Failed to Delete the Comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  return (
    <div className="flex gap-4">
      {isCommentOwner && (
        <Button
          variant="link"
          onClick={() => setIsEditing(true)}
          disabled={(comment as OptimisticComment).optimistic}
        >
          Edit
        </Button>
      )}

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        modal={true}
      >
        <DialogTrigger asChild>
          <Button variant="destructive-link">Delete</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <p className="dark:test-neutral-400 text-neutral-600">
              Are you sure you want to delete this comment?.This action cannot
              be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: comment.id })}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
