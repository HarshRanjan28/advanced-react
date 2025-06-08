import { Experience } from "@advanced-react/server/database/schema";
import { experienceValidationSchema } from "@advanced-react/shared/schema/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useExperienceMutation } from "../hooks/useExperienceMutation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { Button } from "@/features/shared/components/ui/Button";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { LocationPicker } from "@/features/shared/components/LocationPicker";

type ExperienceFormData = z.infer<typeof experienceValidationSchema>;

type ExperienceFormProps = {
  experience?: Experience;
  onSuccess: (id: Experience["id"]) => void;
  onCancel?: (id?: Experience["id"]) => void;
};

export function ExperienceForm({
  experience,
  onSuccess,
  onCancel,
}: ExperienceFormProps) {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceValidationSchema),
    defaultValues: {
      id: experience?.id ?? undefined,
      title: experience?.title ?? "",
      content: experience?.content ?? "",
      scheduledAt: experience?.scheduledAt ?? "",
      url: experience?.url ?? null,
      location: experience?.location
        ? JSON.parse(experience?.location ?? "")
        : undefined,
    },
  });
  const { addMutation, editMutation } = useExperienceMutation({
    add: {
      onSuccess,
    },
    edit: {
      onSuccess,
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined || value !== null) {
        if (key === "location") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    }
    mutation.mutate(formData);
  });

  const mutation = experience ? editMutation : addMutation;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Title" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <TextArea {...field} placeholder="Description" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="location"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <LocationPicker {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex py-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>

          <Button type="button" variant="ghost" onClick={() => onCancel?.(experience?.id)}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
