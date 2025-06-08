import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { UserAvatar } from "./UserAvatar";
import { UserWithContext } from "../types";

type UserCardProps = {
  user: UserWithContext;
  rightComponent?: (user: UserWithContext) => React.ReactNode;
};

export function UserCard({ user, rightComponent }: UserCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <Link to="/users/$userId" params={{ userId: user.id }}>
        <UserAvatar user={user} />
      </Link>
      {rightComponent && rightComponent(user)}
    </Card>
  );
}
