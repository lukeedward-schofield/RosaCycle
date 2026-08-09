import { useEffect, useRef, useState } from 'react';
import { Upload, Circle, RefreshCw, AlertTriangle, RotateCcw, Check } from 'lucide-react';

/**
 * Live camera viewfinder. Uses getUserMedia for a real in-page feed and
 * canvas to capture a still frame on shutter tap — this replaces the old
 * file-input-only approach, which had inconsistent "open camera directly"
 * behavior on Android (iOS honored the `capture` hint reliably; Android did
 * not, per browser vendor, and often fell back to the gallery/file chooser).
 *
 * IMPORTANT: getUserMedia requires a secure context — it only works over
 * HTTPS, or on `http://localhost` specifically. Testing over a plain LAN IP
 * like `http://192.168.x.x:5173` will NOT get camera access; the browser
 * blocks it outright. Test via `https://` (e.g. a Railway deploy, or a local
 * tunnel like ngrok) instead.
 *
 * Falls back to the gallery/file picker if camera permission is denied or no
 * camera is available, so the flow is never fully blocked.
 */
export default function CameraViewfinder({ previewImage, boundingBox, onCapture, onFileSelected, onFlip, onRetake }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsStreamReady(false);
  };

  useEffect(() => {
    // Don't (re)start the camera once a photo has already been captured —
    // previewImage takes over the display until the parent screen resets it.
    if (previewImage) {
      stopStream();
      return;
    }

    let cancelled = false;

    const startStream = async () => {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsStreamReady(true);
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera access was denied. You can still upload a photo instead.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera was found on this device. You can upload a photo instead.');
        } else {
          setCameraError('Could not start the camera. You can upload a photo instead.');
        }
      }
    };

    startStream();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, previewImage]);

  const openGallery = () => galleryInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
    e.target.value = '';
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !isStreamReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onFileSelected(file);
      },
      'image/jpeg',
      0.92
    );
  };

  const handleShutterClick = () => {
    captureFrame();
  };

  const handleFlip = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    onFlip?.();
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewImage ? (
        <img src={previewImage} alt="Camera preview" className="w-full h-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}

      {!previewImage && cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-8 text-center">
          <AlertTriangle size={32} className="text-amber-400" />
          <p className="text-white text-sm">{cameraError}</p>
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

      {previewImage ? (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="rounded-2xl bg-black/65 backdrop-blur-sm p-3">
            <p className="text-white text-sm font-semibold text-center mb-3">Use this photo?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onRetake}
                className="h-11 rounded-xl border border-white/70 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <RotateCcw size={18} />
                Retake
              </button>
              <button
                type="button"
                onClick={onCapture}
                className="h-11 rounded-xl bg-brand-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Check size={18} />
                Use Photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6 bg-gradient-to-t from-black/60 to-transparent">
          <button onClick={openGallery} aria-label="Upload from gallery" className="text-white active:scale-90 transition-transform">
            <Upload size={26} />
          </button>
          <button
            onClick={handleShutterClick}
            aria-label="Capture"
            disabled={!isStreamReady}
            className="active:scale-90 transition-transform disabled:opacity-40"
          >
            <Circle size={64} className="text-white" strokeWidth={2.5} />
          </button>
          <button onClick={handleFlip} aria-label="Flip camera" className="w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white active:scale-90 transition-transform">
            <RefreshCw size={20} />
          </button>
        </div>
      )}
    </div>
  );
}