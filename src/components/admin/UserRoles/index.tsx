
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog } from 'lucide-react';
import UserManagementTabs from './UserManagementTabs';

const UserRoles = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCog className="mr-2 h-6 w-6" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Add new users or manage existing roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTabs />
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 flex justify-between text-sm text-gray-500">
          <p>Admin users have full access to the dashboard. Cook users can manage orders and inventory.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserRoles;
