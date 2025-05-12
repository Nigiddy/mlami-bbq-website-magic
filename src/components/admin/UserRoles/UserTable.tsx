
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserTableRow from './UserTableRow';
import UserTableLoading from './UserTableLoading';
import UserTableEmpty from './UserTableEmpty';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

interface UserTableProps {
  users: Profile[];
  loading: boolean;
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
  onRefresh: () => void;
}

const UserTable = ({ users, loading, onUpdateRole, onRefresh }: UserTableProps) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  if (loading) {
    return <UserTableLoading />;
  }

  if (users.length === 0) {
    return <UserTableEmpty onRefresh={onRefresh} />;
  }

  const handleEditClick = (user: Profile) => {
    setEditingUserId(user.id);
    setSelectedRole(user.role || 'user');
  };

  const handleSaveClick = async (userId: string) => {
    try {
      setUpdatingUserId(userId);
      await onUpdateRole(userId, selectedRole);
      setEditingUserId(null);
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole('');
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-end p-2 bg-muted/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Cook</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              editingUserId={editingUserId}
              selectedRole={selectedRole}
              updatingUserId={updatingUserId}
              onEditClick={handleEditClick}
              onSaveClick={handleSaveClick}
              onCancelEdit={handleCancelEdit}
              setSelectedRole={setSelectedRole}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
