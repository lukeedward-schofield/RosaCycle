import { Upload, Circle, RefreshCw } from 'lucide-react';

/**
 * Camera viewfinder shell. In the real app, this wraps a live camera feed.
 * `boundingBox` is a placeholder prop: { x, y, width, height } in percent (0-100),
 * drawn as an overlay rectangle. Actual AI detection logic = Integration Lead;
 * this component only needs to render a box if coordinates are passed in.
 */
export default function CameraViewfinder({ previewImage, boundingBox, onCapture, onUpload, onFlip }) {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {previewImage ? (
        previewImage === 'captured-placeholder' ? (
          // Real camera capture isn't wired up yet (Integration Lead concern) —
          // show a placeholder state instead of a broken <img> for the mock token.
          <div className="w-full h-full flex items-center justify-center text-white text-sm">
            Photo captured
          </div>
        ) : (
          <img src={previewImage} alt="Camera preview" className="w-full h-full object-cover" />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
          Camera preview
        </div>
      )}

      {boundingBox && (
        <div
          className="absolute border-2 border-sky-400 rounded-md"
          style={{
            left: `${boundingBox.x}%`,
            top: `${boundingBox.y}%`,
            width: `${boundingBox.width}%`,
            height: `${boundingBox.height}%`,
          }}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 bg-gradient-to-t from-black/60 to-transparent">
        <button onClick={onUpload} aria-label="Upload from gallery" className="text-white active:scale-90 transition-transform">
          <Upload size={26} />
        </button>
        <button onClick={onCapture} aria-label="Capture" className="active:scale-90 transition-transform">
          <Circle size={64} className="text-white" strokeWidth={2.5} />
        </button>
        <button onClick={onFlip} aria-label="Flip camera" className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white active:scale-90 transition-transform">
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
