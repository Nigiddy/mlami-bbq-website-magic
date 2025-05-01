
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

interface PromoteUserFormProps {
  onPromote: (email: string) => void;
  isPromoting: boolean;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const PromoteUserForm = ({ 
  onPromote, 
  isPromoting, 
  selectedRole, 
  onRoleChange 
}: PromoteUserFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onPromote(values.email);
    form.reset();
  };

  return (
    <div className="border rounded-md p-4 bg-white/40 backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-4">Promote User</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter user's email address" 
                    {...field} 
                    disabled={isPromoting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="role-select">Role</FormLabel>
              <Select 
                value={selectedRole} 
                onValueChange={onRoleChange}
                disabled={isPromoting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="cook">Head Cook</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full"
                disabled={isPromoting}
              >
                {isPromoting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  `Promote to ${selectedRole}`
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PromoteUserForm;
