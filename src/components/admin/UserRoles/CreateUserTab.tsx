
import CreateUserForm from '../CreateUserForm';

interface CreateUserTabProps {
  onUserCreated: () => void;
}

const CreateUserTab = ({ onUserCreated }: CreateUserTabProps) => {
  return (
    <CreateUserForm onUserCreated={onUserCreated} />
  );
};

export default CreateUserTab;
