
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserCog } from 'lucide-react';

// Import the refactored components
import UserTable from './UserTable';
import PromoteUserForm from './PromoteUserForm';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

const UserRoles = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [promoting, setPromoting] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('admin');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('email');

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (email: string, role: string) => {
    setPromoting(true);

    try {
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          toast({
            title: 'User not found',
            description: 'No user with this email exists in the system',
            variant: 'destructive',
          });
        } else {
          throw userError;
        }
        return;
      }

      if (existingUser?.role === role) {
        toast({
          title: `Already a ${role}`,
          description: `This user already has ${role} privileges`,
          variant: 'default',
        });
        return;
      }

      // Update the user's role directly
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('email', email);

      if (updateError) throw updateError;

      toast({
        title: 'Success!',
        description: `${email} has been promoted to ${role}`,
      });

      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to promote user',
        variant: 'destructive',
      });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="mr-2 h-6 w-6" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Promote users to admin or cook roles, or view existing roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <PromoteUserForm 
              onPromote={(email) => promoteUser(email, selectedRole)}
              isPromoting={promoting} 
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">User Roles</h3>
              <UserTable users={users} loading={loading} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 flex justify-between text-sm text-gray-500">
          <p>Admin users have full access to the dashboard. Cook users can manage orders and inventory.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserRoles;
