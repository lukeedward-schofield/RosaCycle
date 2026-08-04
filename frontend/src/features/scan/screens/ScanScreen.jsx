import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import BottomNav from '@/shared/components/layout/BottomNav';
import CameraViewfinder from '@/features/scan/components/CameraViewfinder';
import { setPendingCapture } from '@/shared/lib/pendingCapture';

/**
 * AI scan step for a Trade item — reached only from within the Trades flow
 * (post a new item, or send an offer on someone else's item). This is
 * distinct from ResourceSpotScreen (the bottom-nav Camera tab), which
 * reports a location, not an item, and never creates a Trade.
 */
export default function ScanScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = location.state?.context || 'posting'; // 'posting' | 'bidding'
  const tradeId = location.state?.tradeId;

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelected = (file) => {
    setPendingCapture(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const goToConfirm = () => {
    navigate('/trades/scan/confirm', { state: { context, tradeId } });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header title={context === 'posting' ? 'Post an Item' : 'Create Offer'} showBell={false} />
      <div className="flex-1 relative min-h-0 pb-16">
        <CameraViewfinder
          previewImage={previewUrl}
          onCapture={goToConfirm}
          onFileSelected={handleFileSelected}
          onFlip={() => {}}
        />
        {previewUrl && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">Photo captured. Tap shutter again to continue</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
