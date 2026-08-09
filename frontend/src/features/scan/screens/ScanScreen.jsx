import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import BottomNav from '@/shared/components/layout/BottomNav';
import CameraViewfinder from '@/features/scan/components/CameraViewfinder';
import { setPendingCapture, clearPendingCapture } from '@/shared/lib/pendingCapture';

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
    console.log("FILE SELECTED: ", file)
    setPendingCapture(file);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return URL.createObjectURL(file);
    });
  };

  const handleRetake = () => {
    clearPendingCapture();
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return null;
    });
  };

  const goToConfirm = () => {
    console.log('GOING TO CONFIRM');
    console.log('pending capture should exist');
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
          onRetake={handleRetake}
        />
      </div>
      <BottomNav />
    </div>
  );
}
