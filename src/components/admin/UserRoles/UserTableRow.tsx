
import { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import UserRoleSelector from './UserRoleSelector';
import UserRoleBadge from './UserRoleBadge';
import UserRoleIndicator from './UserRoleIndicator';
import UserTableActions from './UserTableActions';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

interface UserTableRowProps {
  user: Profile;
  editingUserId: string | null;
  selectedRole: string;
  updatingUserId: string | null;
  onEditClick: (user: Profile) => void;
  onSaveClick: (userId: string) => void;
  onCancelEdit: () => void;
  setSelectedRole: (role: string) => void;
}

const UserTableRow = ({ 
  user,
  editingUserId,
  selectedRole,
  updatingUserId,
  onEditClick,
  onSaveClick,
  onCancelEdit,
  setSelectedRole
}: UserTableRowProps) => {
  const isEditing = editingUserId === user.id;
  
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{user.full_name || '-'}</TableCell>
      <TableCell>
        {isEditing ? (
          <UserRoleSelector 
            value={selectedRole} 
            onChange={setSelectedRole} 
          />
        ) : (
          <UserRoleBadge role={user.role} />
        )}
      </TableCell>
      <TableCell>
        <UserRoleIndicator hasRole={user.role === 'admin'} />
      </TableCell>
      <TableCell>
        <UserRoleIndicator hasRole={user.role === 'cook'} />
      </TableCell>
      <TableCell>
        <UserTableActions
          isEditing={isEditing}
          userId={user.id}
          isUpdating={updatingUserId === user.id}
          onEditClick={() => onEditClick(user)}
          onSaveClick={() => onSaveClick(user.id)}
          onCancelEdit={onCancelEdit}
        />
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
