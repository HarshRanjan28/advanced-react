import { changeEmailSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
} from "@/features/shared/components/ui/Dialog";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export function ChangeEmailDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues:{
        email:"",
        password:""
    }
  });

  const changeEmailMutation = trpc.auth.changeEmail.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      form.reset();
      setIsOpen(false);
      toast({
        title: "Email changed successfully",
        description: "Your email has been changed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error changing email",
        description: error.message,
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    changeEmailMutation.mutate(data);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Update Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="cosdensolution@.io"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel></FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="********" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={changeEmailMutation.isPending}>
                {changeEmailMutation.isPending ? "loading..." : "Change Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
