
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserTable from './UserTable';
import PromoteUserForm from '../PromoteUserForm';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

interface ManageUsersTabProps {
  refreshFlag: number;
  onRefresh: () => void;
}

const ManageUsersTab = ({ refreshFlag, onRefresh }: ManageUsersTabProps) => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [promoting, setPromoting] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [refreshFlag]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      
      // First get all users from auth.users via profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .order('email');

      if (error) {
        throw error;
      }

      console.log('Users fetched:', data?.length || 0);
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
      onRefresh();
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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating user role:', userId, newRole);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Role Updated',
        description: 'User role has been updated successfully',
      });
      
      // Refresh the user list
      onRefresh();
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };

  return (
    <div className="space-y-6">
      <PromoteUserForm 
        onPromote={(email) => promoteUser(email, selectedRole)}
        isPromoting={promoting} 
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">User Roles</h3>
        <UserTable 
          users={users} 
          loading={loading} 
          onUpdateRole={updateUserRole}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
};

export default ManageUsersTab;
