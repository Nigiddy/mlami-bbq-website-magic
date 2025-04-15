
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormProps = {
  onLogin: (values: z.infer<typeof loginSchema>) => Promise<void>;
  isLoading: boolean;
  onToggleForm: () => void;
};

const LoginForm = ({ onLogin, isLoading, onToggleForm }: LoginFormProps) => {
  // Initialize login form with zod resolver
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onLogin)} 
        className="space-y-4"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="admin@example.com" 
                    {...field} 
                    autoComplete="username"
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
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
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    autoComplete="current-password"
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading 
              ? 'Logging in...'
              : <><ArrowRight className="w-4 h-4 mr-2" /> Login</>
            }
          </Button>

          <Button 
            type="button" 
            variant="link" 
            onClick={onToggleForm}
            className="text-sm"
          >
            Need an account? Sign Up
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoginForm;
