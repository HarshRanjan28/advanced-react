import { CommentCard } from "./CommentCard";
import { CommentForList } from "../types";

type CommentsListProps = {
  comments: CommentForList[];
  noCommentsMessage?: string;
};

export function CommentsList({
  comments,
  noCommentsMessage = "No Comments Yet.",
}: CommentsListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}

      {comments.length === 0 && (
        <div className="flex justify-center">{noCommentsMessage}</div>
      )}
    </div>
  );
}
