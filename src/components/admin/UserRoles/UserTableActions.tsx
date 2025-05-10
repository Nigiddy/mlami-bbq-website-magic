
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';

interface UserTableActionsProps {
  isEditing: boolean;
  userId: string;
  isUpdating: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelEdit: () => void;
}

const UserTableActions = ({ 
  isEditing, 
  userId, 
  isUpdating,
  onEditClick, 
  onSaveClick, 
  onCancelEdit 
}: UserTableActionsProps) => {
  
  if (isEditing) {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSaveClick}
          disabled={isUpdating}
          className="h-8 w-8 text-green-600 hover:text-green-700"
        >
          {isUpdating ? (
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-green-500" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancelEdit}
          disabled={isUpdating}
          className="h-8 w-8 text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onEditClick}
      className="h-8 w-8"
    >
      <Edit2 className="h-4 w-4" />
    </Button>
  );
};

export default UserTableActions;
