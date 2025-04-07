
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';

const QRCodeGenerator = () => {
  const [tableNumber, setTableNumber] = useState('1');
  const [size, setSize] = useState(200);
  
  const downloadQRCode = () => {
    const svg = document.getElementById('table-qrcode');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `mlami-bbq-table-${tableNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  // Generate URL with table parameter
  const qrUrl = `${window.location.origin}/menu?table=${tableNumber}`;

  return (
    <div className="space-y-6 p-6 backdrop-blur-md bg-white/60 rounded-xl shadow-lg border border-white/20">
      <h2 className="text-2xl font-semibold">Table QR Code Generator</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Table Number</label>
            <Input 
              type="number" 
              min="1"
              value={tableNumber} 
              onChange={(e) => setTableNumber(e.target.value)}
              className="backdrop-blur-sm bg-white/40"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">QR Size (px)</label>
            <Input 
              type="number" 
              min="100"
              step="50"
              value={size} 
              onChange={(e) => setSize(Number(e.target.value))}
              className="backdrop-blur-sm bg-white/40"
            />
          </div>
          
          <Button 
            onClick={downloadQRCode}
            className="w-full bg-bbq-orange hover:bg-bbq-orange/90 flex items-center gap-2"
          >
            <Download size={16} />
            Download QR Code
          </Button>
        </div>
        
        <Card className="p-4 flex items-center justify-center backdrop-blur-md bg-white/40 border border-white/20">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <QRCodeSVG 
                id="table-qrcode"
                value={qrUrl}
                size={size}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold">Table #{tableNumber}</p>
              <p className="text-sm text-gray-500">Scan for Menu</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
