import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/features/shared/components/ui/Form";
import { userCredentialsSchema } from "@advanced-react/shared/schema/auth";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/features/shared/components/ui/Input";
import { Button } from "@/features/shared/components/ui/Button";
import { trpc } from "@/router";
import { useToast } from "@/features/shared/hooks/useToast";
import Link from "@/features/shared/components/ui/Link";

const registerCredentialSchema = userCredentialsSchema;

type registerFormData = z.infer<typeof registerCredentialSchema>;

export function RegisterForm() {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const form = useForm<registerFormData>({
    resolver: zodResolver(registerCredentialSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const registermutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate(),
        toast({
          title: "Registration successful",
          description: "You have been registered successfully",
        });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    registermutation.mutate(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="John Doe" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="dev@example.com" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="*********" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          disabled={registermutation.isPending}
          className="w-full"
          type="submit"
        >
          {registermutation.isPending ? "Registering..." : "Register"}
        </Button>
        <div className="flex justify-center">
          <Link to="/login">Already have account? Login</Link>
        </div>
      </form>
    </Form>
  );
}
