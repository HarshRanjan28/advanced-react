import { Experience } from "@advanced-react/server/database/schema";
import { z } from "zod";
import { commentValidationSchema } from "@advanced-react/shared/schema/comment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { Button } from "@/features/shared/components/ui/Button";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { OptimisticComment } from "../types";

type CommentCreateFormData = z.infer<typeof commentValidationSchema>;

type CommentCreateFormProps = {
  experience: Experience;
};

export function CreateCommentForm({ experience }: CommentCreateFormProps) {
  const { currentUser } = useCurrentUser();
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const form = useForm<CommentCreateFormData>({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: {
      content: "",
    },
  });

  const addCommentMutation = trpc.comments.add.useMutation({
    onMutate: async ({ content, experienceId }) => {
      form.reset();
      if (!currentUser) return;
      await Promise.all([
        utils.comments.byExperienceId.cancel({ experienceId }),
        utils.experiences.byId.cancel({ id: experienceId }),
      ]);

      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({ experienceId }),
        experienceById: utils.experiences.byId.getData({ id: experienceId }),
      };

      const optimisticComment: OptimisticComment = {
        id: Math.random(),
        optimistic: true,
        content: content,
        experienceId,
        experience,
        userId: currentUser.id,
        user: currentUser,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isLiked:false,
        likesCount:0
      };

      utils.comments.byExperienceId.setData(
        { experienceId: experience.id },
        (oldData) => {
          if (!oldData) return;

          return [optimisticComment, ...oldData];
        },
      );

      utils.experiences.byId.setData({ id: experienceId }, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          commentsCount: oldData.commentsCount + 1,
        };
      });

      const { dismiss } = toast({
        title: "Comment added",
        description: "Added comment Successfully",
      });

      return { previousData, dismiss };
    },

    onSuccess: async ({ experienceId }) => {
      await utils.comments.byExperienceId.invalidate({ experienceId });
    },
    onError: (error, { experienceId }, context) => {
      context?.dismiss();

      utils.comments.byExperienceId.setData(
        { experienceId },
        context?.previousData.byExperienceId,
      );
      utils.experiences.byId.setData(
        { id: experienceId },
        context?.previousData.experienceById,
      );
      toast({
        title: "Failed to add toast",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!currentUser) {
    return (
      <div className="text-center text-neutral-500">
        Please log in to add a comment.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          addCommentMutation.mutate({
            content: data.content,
            experienceId: experience.id,
          });
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea placeholder="Add a Comment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={addCommentMutation.isPending}>
          Add Comment
        </Button>
      </form>
    </Form>
  );
}
