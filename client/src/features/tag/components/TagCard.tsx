import { Badge } from "@/features/shared/components/ui/Badge";
import Link from "@/features/shared/components/ui/Link";
import { Tag } from "@advanced-react/server/database/schema";

type TagCardProps = {
  tag: Tag;
};

export function TagCard({ tag }: TagCardProps) {
    console.log('tag',tag);
  return (
    <Badge>
      <Link to="/tags/$tagId" params={{ tagId: tag.id }} variant="ghost">
        {tag.name}
      </Link>
    </Badge>
  );
}
