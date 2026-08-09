import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import BottomNav from '@/shared/components/layout/BottomNav';
import CameraViewfinder from '@/features/scan/components/CameraViewfinder';
import { setPendingCapture, clearPendingCapture } from '@/shared/lib/pendingCapture';

/**
 * Bottom-nav "Camera" tab. Captures a photo of a resource spot (a location
 * with recyclable/reusable material worth flagging) and reports it as a
 * pin on the Map — this never creates a Trade. Trade item scanning lives
 * at /trades/scan instead (see ScanScreen.jsx).
 */
export default function ResourceSpotScreen() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelected = (file) => {
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
    navigate('/camera/confirm');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header title="Resource Spot" showBell={false} />
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
