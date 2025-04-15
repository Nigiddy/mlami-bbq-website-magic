
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PromoteUserFormProps {
  onPromote: (email: string) => Promise<void>;
  isPromoting: boolean;
}

const PromoteUserForm = ({ onPromote, isPromoting }: PromoteUserFormProps) => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const handleSubmit = () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    onPromote(email);
  };

  return (
    <div>
      <h3 className="text-lg font-medium">Promote to Admin</h3>
      <p className="text-sm text-gray-500 mb-4">
        Enter a user's email to grant them admin privileges
      </p>
      
      <div className="flex gap-2">
        <div className="flex-grow">
          <Input
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? 'border-red-500' : ''}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isPromoting}
        >
          {isPromoting ? 'Promoting...' : 'Make Admin'}
        </Button>
      </div>
    </div>
  );
};

export default PromoteUserForm;
