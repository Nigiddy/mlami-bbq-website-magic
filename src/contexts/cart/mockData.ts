
import { CartItem, Order } from './types';

export const initialMenuItems: CartItem[] = [
  {
    id: 1,
    name: "Smoked Brisket",
    price: "1899",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    quantity: 0,
    inStock: true,
  },
  {
    id: 2,
    name: "Pulled Pork Sandwich",
    price: "1499",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    quantity: 0,
    inStock: true,
  },
  {
    id: 3,
    name: "BBQ Ribs",
    price: "2299",
    image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
    quantity: 0,
    inStock: false,
  },
];

export const initialOrders: Order[] = [
  {
    id: 1,
    items: [
      { 
        id: 1, 
        name: "Smoked Brisket", 
        price: "1899", 
        image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
        quantity: 2
      },
    ],
    customer: { name: "John Doe", phone: "0712345678" },
    status: "Pending",
    total: "3798",
    subtotal: "3798",
    createdAt: new Date().toISOString(),
    tableNumber: "5",
  },
  {
    id: 2,
    items: [
      { 
        id: 2, 
        name: "Pulled Pork Sandwich", 
        price: "1499", 
        image: "/public/lovable-uploads/75313179-b4bc-4abc-8297-ddc74500e82f.png",
        quantity: 1
      },
    ],
    customer: { name: "Jane Smith", phone: "0723456789" },
    status: "Completed",
    total: "1499",
    subtotal: "1499",
    createdAt: new Date().toISOString(),
    tableNumber: "3",
  },
];
