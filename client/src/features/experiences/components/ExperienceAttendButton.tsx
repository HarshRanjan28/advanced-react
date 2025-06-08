import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import { Experience } from "@advanced-react/server/database/schema";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceAttendButtonProps = {
  experienceId: Experience["id"];
  isAttending: boolean;
};

export function ExperienceAttendButton({
  experienceId,
  isAttending,
}: ExperienceAttendButtonProps) {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }
  const { attendMutation,unattendMutation } = useExperienceMutation();

  return (
    <Button
      variant={isAttending ? "outline" : "default"}
      onClick={() => {
        if (isAttending) {
          unattendMutation.mutate({id:experienceId});
        } else {
          attendMutation.mutate({ id: experienceId });
        }
      }}
      disabled={attendMutation.isPending}
    >
      {isAttending ? "Not Going" : "Going"}
    </Button>
  );
}
