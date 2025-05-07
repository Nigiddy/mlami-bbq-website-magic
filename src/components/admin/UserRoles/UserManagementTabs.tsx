
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManageUsersTab from './ManageUsersTab';
import CreateUserTab from './CreateUserTab';

const UserManagementTabs = () => {
  const [activeTab, setActiveTab] = useState<string>('manage');
  const [refreshFlag, setRefreshFlag] = useState<number>(0);

  const refreshUserList = () => {
    setRefreshFlag(prev => prev + 1);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manage">Manage Existing Users</TabsTrigger>
        <TabsTrigger value="create" className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="manage">
        <ManageUsersTab 
          refreshFlag={refreshFlag} 
          onRefresh={refreshUserList} 
        />
      </TabsContent>
      
      <TabsContent value="create">
        <CreateUserTab onUserCreated={refreshUserList} />
      </TabsContent>
    </Tabs>
  );
};

export default UserManagementTabs;
