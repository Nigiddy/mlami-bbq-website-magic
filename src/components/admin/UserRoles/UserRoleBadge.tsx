
import { Badge } from '@/components/ui/badge';

interface UserRoleBadgeProps {
  role: string | null;
}

const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'cook': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Badge variant={getRoleBadgeVariant(role)}>
      {role || 'user'}
    </Badge>
  );
};

export default UserRoleBadge;
