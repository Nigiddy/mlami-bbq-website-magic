
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const GoogleMap = ({ address }: { address: string }) => {
  const [mapUrl, setMapUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Encode the address for the URL
    const encodedAddress = encodeURIComponent(address);
    
    // Create the Google Maps embed URL
    const url = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`;
    
    setMapUrl(url);
    setIsLoading(false);
  }, [address]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bbq-orange"></div>
        </div>
      ) : (
        <>
          {/* Placeholder for when API key is not set */}
          <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center text-gray-600 z-10">
            <MapPin size={48} className="text-bbq-orange mb-2" />
            <p className="mb-2 font-medium text-lg">Map Integration</p>
            <p className="text-sm text-center max-w-md px-4">
              To display the actual Google Map, replace 'YOUR_API_KEY' in GoogleMap.tsx with your Google Maps API key.
            </p>
            <p className="text-sm mt-4">Location: {address}</p>
          </div>
          
          {/* This iframe will be visible when a valid API key is added */}
          <iframe 
            title="Google Maps Location"
            className="absolute inset-0 w-full h-full z-20 opacity-0" // Initially hidden with opacity-0
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </>
      )}
    </div>
  );
};

export default GoogleMap;
