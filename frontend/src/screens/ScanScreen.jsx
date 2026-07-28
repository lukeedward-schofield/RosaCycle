import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import CameraViewfinder from '../components/scan/CameraViewfinder';

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

  const [previewImage, setPreviewImage] = useState(null);

  const handleCapture = () => {
    // Placeholder: real camera capture wiring is an Integration Lead concern.
    // For now, simulate a captured photo so the flow can be demoed end-to-end.
    setPreviewImage('captured-placeholder');
  };

  const goToConfirm = () => {
    navigate('/trades/scan/confirm', { state: { context, tradeId } });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header title={context === 'posting' ? 'Post an Item' : 'Create Offer'} showBell={false} />
      <div className="flex-1 relative min-h-0 pb-16">
        <CameraViewfinder
          previewImage={previewImage}
          onCapture={previewImage ? goToConfirm : handleCapture}
          onUpload={goToConfirm}
          onFlip={() => {}}
        />
        {previewImage && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">Photo captured. Tap shutter again to continue</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
