import Spinner from "@/features/shared/components/ui/Spinner";
import { UserForList, UserWithContext } from "../types";
import { UserCard } from "./UserCard";

type UserListProps = {
  users: UserForList[];
  isLoading: boolean;
  rightComponent?:(user:UserWithContext)=>React.ReactNode
};

export function UserList({ users, isLoading ,rightComponent}: UserListProps) {
  return (
    <div className="flex flex-col gap-4">
      {users.map((user) => (
        <UserCard user={user} key={user.id} rightComponent={rightComponent}/>
      ))}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {!isLoading && users.length == 0 && (
        <div className="flex justify-center py-4">
          <p>No User Found</p>
        </div>
      )}
    </div>
  );
}
