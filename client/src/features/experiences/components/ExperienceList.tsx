import Spinner from "@/features/shared/components/ui/Spinner";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceForList } from "../types";

type ExperienceListProps = {
  experience: ExperienceForList[];
  isLoading: boolean;
  noExperienceMessage?: string;
};

export function ExperienceList({
  experience,
  isLoading,
  noExperienceMessage = "No Experience Found",
}: ExperienceListProps) {
  return (
    <div className="space-y-4">
      {experience.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && experience.length == 0 && (
        <div className="flex justify-center">{noExperienceMessage}</div>
      )}
    </div>
  );
}
