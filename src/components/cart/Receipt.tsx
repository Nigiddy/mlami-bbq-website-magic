
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ReceiptText, Download, ArrowRight } from 'lucide-react';
import { CartItem } from '@/contexts/cart/types';

interface ReceiptProps {
  transactionId?: string | null;
  phoneNumber: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  paymentTime?: string;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
  return `Ksh ${amount.toFixed(2)}`;
};

const Receipt: React.FC<ReceiptProps> = ({
  transactionId,
  phoneNumber,
  tableNumber,
  items,
  subtotal,
  paymentTime = new Date().toISOString(),
  onClose,
}) => {
  const formattedDate = new Date(paymentTime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const formattedTime = new Date(paymentTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="print:bg-white">
      <Card className="border-2 border-gray-200 shadow-md print:shadow-none print:border-0">
        <CardHeader className="border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                Payment Receipt
              </CardTitle>
              <CardDescription>
                {formattedDate} - {formattedTime}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="font-semibold">BBQ Restaurant</p>
              <p className="text-xs text-gray-500">Nairobi, Kenya</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Table</p>
              <p className="font-medium">{tableNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{phoneNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium">M-Pesa</p>
            </div>
            <div>
              <p className="text-gray-500">Transaction ID</p>
              <p className="font-medium truncate">{transactionId || "N/A"}</p>
            </div>
          </div>
          
          <div className="my-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity || 1}</TableCell>
                    <TableCell className="text-right">{formatCurrency(parseFloat(item.price))}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(parseFloat(item.price) * (item.quantity || 1))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(subtotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 border-t pt-4">
          <div className="text-center w-full">
            <p className="text-sm text-gray-500">Thank you for dining with us!</p>
          </div>
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={handlePrintReceipt}
            >
              <Download className="h-4 w-4" />
              Print
            </Button>
            <Button 
              size="sm"
              className="flex items-center gap-2"
              onClick={onClose}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Print-only styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:bg-white,
            .print\\:bg-white * {
              visibility: visible;
            }
            .print\\:bg-white {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button {
              display: none !important;
            }
          }
        `
      }} />
    </div>
  );
};

export default Receipt;
