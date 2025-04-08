
import React from 'react';
import { Phone, TableIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const orderSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 digits")
    .regex(/^(?:254|\+254|0)?(7[0-9]{8})$/, "Please enter a valid Kenyan phone number"),
  tableNumber: z.string()
    .min(1, "Table number is required")
    .regex(/^[1-9][0-9]*$/, "Please enter a valid table number")
});

export type PaymentFormValues = z.infer<typeof orderSchema>;

interface PaymentFormProps {
  defaultTableNumber: string;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
  isProcessing: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  defaultTableNumber, 
  onSubmit,
  isProcessing 
}) => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      phoneNumber: '',
      tableNumber: defaultTableNumber || '',
    },
  });

  React.useEffect(() => {
    if (defaultTableNumber) {
      form.setValue('tableNumber', defaultTableNumber);
    }
  }, [defaultTableNumber, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tableNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Number</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <TableIcon className="h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="e.g. 5" 
                    {...field} 
                    className="flex-1 backdrop-blur-sm bg-white/40"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Enter your table number (can be found on your table)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>M-Pesa Phone Number</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="e.g. 0712345678" 
                    {...field} 
                    className="flex-1 backdrop-blur-sm bg-white/40"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-gray-500">
                Enter the phone number registered with M-Pesa
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 backdrop-blur-sm"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay with M-Pesa
                <Phone className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;
