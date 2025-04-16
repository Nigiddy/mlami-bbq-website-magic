
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import PersonalInfoSection from './PersonalInfoSection';
import ReservationDetails from './ReservationDetails';

interface FormData {
  name: string;
  email: string;
  phone: string;
  guests: string;
  time: string;
  specialRequests: string;
}

const ReservationForm = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    guests: '',
    time: '',
    specialRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reservation submitted:', { ...formData, date });
    toast({
      title: "Reservation Submitted!",
      description: "We've received your reservation and will confirm shortly.",
    });
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      guests: '',
      time: '',
      specialRequests: '',
    });
    setDate(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoSection 
        formData={formData} 
        handleChange={handleChange}
      />
      
      <ReservationDetails 
        formData={formData} 
        date={date}
        setDate={setDate}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
      />
      
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests (Optional)
        </label>
        <Input
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          placeholder="Any special requests or dietary requirements?"
        />
      </div>
      
      <Button type="submit" className="w-full bg-black hover:bg-bbq-orange text-white rounded-full py-6">
        Reserve Now
      </Button>
    </form>
  );
};

export default ReservationForm;
