import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { Experience } from "@advanced-react/server/database/schema";
import { Heart } from "lucide-react";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceFavoritesButtonProps = {
  experienceId: Experience["id"];
  isFavorited: boolean;
  favoritesCount: number;
};

export function ExperienceFavoritesButton({
  experienceId,
  isFavorited,
  favoritesCount,
}: ExperienceFavoritesButtonProps) {
  const { currentUser } = useCurrentUser();

  if (!currentUser) return null;

  const { favoriteMutation, unfavoriteMutation } = useExperienceMutation();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (isFavorited) {
          unfavoriteMutation.mutate({ id: experienceId });
        } else {
          favoriteMutation.mutate({ id: experienceId });
        }
      }}
      disabled={unfavoriteMutation.isPending || favoriteMutation.isPending}
    >
      <Heart
        className={cn("h-6 w-6", isFavorited && "fill-red-500 text-red-500")}
      />
      <span>{favoritesCount}</span>
    </Button>
  );
}
