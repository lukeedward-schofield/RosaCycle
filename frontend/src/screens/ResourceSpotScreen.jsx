import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import CameraViewfinder from '../components/scan/CameraViewfinder';

/**
 * Bottom-nav "Camera" tab. Captures a photo of a resource spot (a location
 * with recyclable/reusable material worth flagging) and reports it as a
 * pin on the Map — this never creates a Trade. Trade item scanning lives
 * at /trades/scan instead (see ScanScreen.jsx).
 */
export default function ResourceSpotScreen() {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

  const handleCapture = () => {
    // Placeholder: real camera capture wiring is an Integration Lead concern.
    setPreviewImage('captured-placeholder');
  };

  const goToConfirm = () => {
    navigate('/camera/confirm');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header title="Resource Spot" showBell={false} />
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
