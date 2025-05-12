
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface UserTableEmptyProps {
  onRefresh: () => void;
}

const UserTableEmpty = ({ onRefresh }: UserTableEmptyProps) => {
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
};

export default UserTableEmpty;
