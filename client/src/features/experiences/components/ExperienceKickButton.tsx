import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import { Experience, User } from "@advanced-react/server/database/schema";
import { useState } from "react";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceKickButtonProps = {
  experienceId: Experience["id"];
  userId: User["id"];
};

export function ExperienceKickButton({
  experienceId,
  userId,
}: ExperienceKickButtonProps) {
  console.log("userId", userId);
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useCurrentUser();

  const { kickMutation } = useExperienceMutation({
    kick: {
      onSuccess: () => {
        setIsOpen(false);
      },
    },
  });

  if (!currentUser) return null;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive-link">Kick</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kick Attendee</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to kick the attendee ? This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={() => kickMutation.mutate({ experienceId, userId })}
            disabled={kickMutation.isPending}
          >
            {kickMutation.isPending ? "Kicking...." : "kick"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
