
import { CheckCircle, XCircle } from 'lucide-react';

interface UserRoleIndicatorProps {
  hasRole: boolean;
}

const UserRoleIndicator = ({ hasRole }: UserRoleIndicatorProps) => {
  if (hasRole) {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  
  return <XCircle className="h-5 w-5 text-gray-300" />;
};

export default UserRoleIndicator;
