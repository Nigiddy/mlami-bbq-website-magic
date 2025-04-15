
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

interface UserTableProps {
  users: Profile[];
  loading: boolean;
}

const UserTable = ({ users, loading }: UserTableProps) => {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Admin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.full_name || '-'}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.role === 'admin' ? 'default' : 'outline'}
                >
                  {user.role || 'user'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.role === 'admin' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-300" />
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
