import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { MultiSelect } from "@/features/shared/components/ui/MultiSelect";
import { Tag } from "@advanced-react/server/database/schema";
import {
  ExperienceFilterParams,
  experienceFiltersSchema,
} from "@advanced-react/shared/schema/experience";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";

type ExperienceFiltersProps = {
  onFilterChange: (filters: ExperienceFilterParams) => void;
  initialfilters: ExperienceFilterParams;
  tags: Tag[];
};

export function ExperienceFilter({
  onFilterChange,
  initialfilters,
  tags,
}: ExperienceFiltersProps) {
  const form = useForm<ExperienceFilterParams>({
    resolver: zodResolver(experienceFiltersSchema),
    defaultValues: initialfilters,
  });
  const handleSubmit = form.handleSubmit((values) => {
    const filters: ExperienceFilterParams = {};

    if (values.q?.trim()) {
      filters.q = values.q.trim();
    }

    if (values.tags) {
      filters.tags = values.tags;
    }
    onFilterChange(filters);
  });

  return (
    <Form {...form}>
      <Card>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    type="search"
                    value={field.value ?? ""}
                    placeholder="Search Experiences"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <MultiSelect
                    options={tags.map((tag) => ({
                      label: tag.name,
                      value: tag.id.toString(),
                    }))}
                    onValueChange={(tags) => {
                      field.onChange(tags.map(Number));
                    }}
                    defaultValue={field.value?.map((tag) => tag.toString())}
                    placeholder="Select tags..."
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </Card>
    </Form>
  );
}
