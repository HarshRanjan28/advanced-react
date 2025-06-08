import { trpc } from "@/router";
import { Experience } from "@advanced-react/server/database/schema";
import { CommentsList } from "./CommentsList";
import { CreateCommentForm } from "./CreateCommentForm";
import { ErrorComponent } from "@/features/shared/components/ErrorComponent";
import Spinner from "@/features/shared/components/ui/Spinner";

type CommentSectionProps = {
  experienceId: Experience["id"];
  commmentsCount: number;
};

export function CommentSection({
  experienceId,
  commmentsCount,
}: CommentSectionProps) {
  const commentsQuery = trpc.comments.byExperienceId.useQuery({ experienceId });

  const experienceQuery = trpc.experiences.byId.useQuery({ id: experienceId });

  if (commentsQuery.error || experienceQuery.error) {
    return <ErrorComponent />;
  }
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comments ({commmentsCount})</h3>

      {commentsQuery.isPending || experienceQuery.isPending ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <>
          <CreateCommentForm experience={experienceQuery.data} />
          <CommentsList comments={commentsQuery.data ?? []} />
        </>
      )}
    </div>
  );
}
