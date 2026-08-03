import { useRef } from 'react';
import { Upload, Circle, RefreshCw } from 'lucide-react';

/**
 * Camera viewfinder shell. There's no live camera feed — capture is a plain
 * <input type="file" accept="image/*"> (mobile browsers show a native
 * camera-or-gallery chooser for this). `onCapture` is only called once a
 * photo has already been selected — it means "continue," not "take photo."
 * `boundingBox` is a placeholder prop: { x, y, width, height } in percent
 * (0-100), drawn as an overlay rectangle, for a future AI-detection box.
 */
export default function CameraViewfinder({ previewImage, boundingBox, onCapture, onFileSelected, onFlip }) {
  const fileInputRef = useRef(null);

  const openPicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = ''; // allow re-selecting the same file again later
  };

  const handleShutterClick = () => {
    if (previewImage) onCapture();
    else openPicker();
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewImage ? (
        <img src={previewImage} alt="Camera preview" className="w-full h-full object-cover" />
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
        <button onClick={openPicker} aria-label="Upload from gallery" className="text-white active:scale-90 transition-transform">
          <Upload size={26} />
        </button>
        <button onClick={handleShutterClick} aria-label="Capture" className="active:scale-90 transition-transform">
          <Circle size={64} className="text-white" strokeWidth={2.5} />
        </button>
        <button onClick={onFlip} aria-label="Flip camera" className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white active:scale-90 transition-transform">
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
