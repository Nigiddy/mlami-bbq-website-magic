
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Edit2, Save, X, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-bbq-orange"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">No users found</p>
        <Button 
          variant="outline" 
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh User List
        </Button>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'cook': return 'secondary';
      default: return 'outline';
    }
  };

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
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.full_name || '-'}</TableCell>
              <TableCell>
                {editingUserId === user.id ? (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="cook">Cook</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge 
                    variant={getRoleBadgeVariant(user.role)}
                  >
                    {user.role || 'user'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {user.role === 'admin' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
              </TableCell>
              <TableCell>
                {user.role === 'cook' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
                )}
              </TableCell>
              <TableCell>
                {editingUserId === user.id ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveClick(user.id)}
                      disabled={updatingUserId === user.id}
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                    >
                      {updatingUserId === user.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-green-500" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
                      disabled={updatingUserId === user.id}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(user)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
