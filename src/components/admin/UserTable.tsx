
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
import { CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
}

const UserTable = ({ users, loading, onUpdateRole }: UserTableProps) => {
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-bbq-orange"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="text-gray-500 text-center py-4">No users found</p>;
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
    await onUpdateRole(userId, selectedRole);
    setEditingUserId(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole('');
  };

  return (
    <div className="rounded-md border">
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
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancelEdit}
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
