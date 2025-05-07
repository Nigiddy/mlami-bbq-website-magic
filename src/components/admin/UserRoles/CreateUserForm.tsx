
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { userFormSchema, UserFormValues } from './validation/userFormSchema';
import { useCreateUser } from './hooks/useCreateUser';
import UserFormFields from './UserFormFields';

interface CreateUserFormProps {
  onUserCreated: () => void;
}

const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const { createUser, loading } = useCreateUser(onUserCreated);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'user'
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    const success = await createUser(values);
    if (success) {
      form.reset();
    }
  };

  return (
    <div className="border rounded-md p-6 bg-white/40 backdrop-blur-sm">
      <h3 className="text-lg font-medium mb-4">Create New User</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <UserFormFields form={form} loading={loading} />
          
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating User...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateUserForm;
