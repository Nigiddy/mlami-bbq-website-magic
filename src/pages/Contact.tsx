
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast({
      title: "Message Sent!",
      description: "We've received your message and will get back to you soon.",
    });
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-bbq-pale-orange py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">
              <span className="font-dancing text-bbq-orange">Contact</span> Us
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have any questions, feedback, or want to make a reservation?
              We'd love to hear from you! Get in touch with us.
            </p>
          </div>
        </div>
        
        <div className="py-16 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-medium mb-6">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="mr-4 h-6 w-6 text-bbq-orange flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Our Location</h3>
                    <p className="text-gray-600">123 BBQ Street, Flavor City, FC 12345</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="mr-4 h-6 w-6 text-bbq-orange flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Phone Number</h3>
                    <p className="text-gray-600">(123) 456-7890</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="mr-4 h-6 w-6 text-bbq-orange flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Email Address</h3>
                    <p className="text-gray-600">info@mlamibbq.com</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-medium mt-12 mb-6">Opening Hours</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Monday - Friday</h3>
                  <p className="text-gray-600">9:00 AM - 10:00 PM</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Saturday - Sunday</h3>
                  <p className="text-gray-600">10:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-medium mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Write your message here..."
                  />
                </div>
                <Button type="submit" className="w-full bg-black hover:bg-bbq-orange text-white rounded-full py-6">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
          
          {/* Google Map (Placeholder) */}
          <div className="mt-16 bg-gray-200 rounded-lg h-[400px] flex items-center justify-center">
            <p className="text-gray-600">
              Map is displayed here. Integrate with Google Maps API for actual functionality.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
