import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import { Experience } from "@advanced-react/server/database/schema";
import { useState } from "react";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceDeleteDialogProps = {
  experience: Experience;
  onSuccess?: (id: Experience["id"]) => void;
};

export function ExperienceDeleteDialog({
  experience,
  onSuccess,
}: ExperienceDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { deleteMutation } = useExperienceMutation({
    delete: {
      onSuccess: (id) => {
        setIsOpen(false);
        onSuccess?.(id);
      },
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive-link">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Experience</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to delete the experience ?. This can not be
          undone
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen((currState) => !currState)}
          >
            Cancel
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            variant="destructive"
            onClick={() => deleteMutation.mutate({ id: experience.id })}
          >
            {deleteMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
