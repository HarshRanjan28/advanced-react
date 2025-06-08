import { Comment } from "@advanced-react/server/database/schema";
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
import { trpc } from "@/router";
import Card from "@/features/shared/components/ui/Card";
import { Button } from "@/features/shared/components/ui/Button";
import { useToast } from "@/features/shared/hooks/useToast";

type EditCommentFormProps = {
  comment: Comment;
  setIsEditing: (value: boolean) => void;
};

type EditCommentFormDataProps = z.infer<typeof commentValidationSchema>;

export function EditCommentForm({
  comment,
  setIsEditing,
}: EditCommentFormProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const form = useForm<EditCommentFormDataProps>({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: {
      content: comment.content,
    },
  });
  const editMutation = trpc.comments.edit.useMutation({
    onMutate: async ({ id, content }) => {
      await utils.comments.byExperienceId.cancel({
        experienceId: comment.experienceId,
      });
      setIsEditing(false);

      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId: comment.experienceId,
        }),
      };

      utils.comments.byExperienceId.setData(
        { experienceId: comment.experienceId },
        (oldData) => {
          if (!oldData) return;

          return oldData.map((comment) =>
            comment.id === id
              ? { ...comment, content, updatedAt: new Date().toISOString() }
              : comment,
          );
        },
      );

      const { dismiss } = toast({
        title: "Comment Updated",
        description: "Your Comment has been updated",
      });

      return { previousData, dismiss };
    },
    onError: (error, _, context) => {
      context?.dismiss,
        utils.comments.byExperienceId.setData(
          { experienceId: comment.experienceId },
          context?.previousData.byExperienceId,
        );

      toast({
        title: "Failed to Update Comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Form {...form}>
      <Card>
        <form
          onSubmit={form.handleSubmit((data) => {
            editMutation.mutate({
              id: comment.id,
              content: data.content,
            });
          })}
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TextArea {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <Button type="submit" disabled={editMutation.isPending}>
              {editMutation.isPending ? "Saving...." : "Save"}
            </Button>
            <Button
              variant="link"
              onClick={() => setIsEditing(false)}
              disabled={editMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </Form>
  );
}
