import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/shared/components/layout/Header';
import PrimaryButton from '@/shared/components/common/PrimaryButton';
import AIDetectedForm from '@/features/scan/components/AIDetectedForm';
import { createTrade, sendOffer, assessTradePhoto } from '@/shared/services/api';
import { getPendingCapture, clearPendingCapture } from '@/shared/lib/pendingCapture';



const BLANK_VALUES = {
  category: '',
  material: '',
  weightKg: '',
  itemName: '',
  quantity: '',
  description: '',
  currentLocation: '',
  pickupLocation: '',
  tradingForType: 'negotiating',
  tradingForValue: '',
};

export default function ScanConfirmScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = location.state?.context || 'posting';
  const tradeId = location.state?.tradeId;

  const [values, setValues] = useState(BLANK_VALUES);
  const [assessing, setAssessing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const imageFile = getPendingCapture();

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
      if (!imageFile) return;

      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {

    let cancelled = false;

    if (!imageFile) {
        setAssessing(false);
        return;
    }

    const assess = async () => {
        try {
            const result = await assessTradePhoto(imageFile);

            if (cancelled) return;

            setValues({
                ...BLANK_VALUES,
                itemName: result.itemName,
                category: result.category,
                material: result.material,
                description: result.description,
                weightKg: result.weightKg,
                quantity: result.quantity,
            });

        } catch (err) {

            console.error(err);

            setError(
                "AI couldn't analyze this image. Please fill in the details manually."
            );

        } finally {
            if(!cancelled){
              setAssessing(false);
          }
        }

    };

    assess();

    return () => {
        cancelled = true;
    };

  }, [imageFile]);

  const canSubmit =
    context === 'posting'
      ? Boolean(
          values.itemName?.trim() &&
            values.category?.trim() &&
            values.material?.trim() &&
            values.quantity &&
            values.currentLocation?.trim()
        )
      : Boolean(values.itemName?.trim() && values.category?.trim() && values.material?.trim());




  const handlePrimaryAction = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      if (context === 'posting') {
        const trade = await createTrade(
          {
            itemName: values.itemName,
            category: values.category,
            material: values.material,
            description: values.description,
            weightKg: values.weightKg,
            quantity: values.quantity,
            locationText: values.currentLocation,
            pickupLocationText: values.pickupLocation,
            tradingForType: values.tradingForType,
            tradingForValue: values.tradingForType === 'specific' ? values.tradingForValue : undefined,
          },
          imageFile
        );
        clearPendingCapture();
        navigate('/trades/scan/created', { state: { trade } });
      } else {
        const offer = await sendOffer(
          tradeId,
          {
            itemName: values.itemName,
            category: values.category,
            material: values.material,
            weightKg: values.weightKg,
            description: values.description,
          },
          imageFile
        );
        clearPendingCapture();
        navigate(`/trades/${tradeId}/offer-sent`, { state: { offer } });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Edit Details" />

      <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Captured item" className="w-full h-full object-cover" />) : (
          'No photo captured'
        )}
      </div>

      <div className="p-5 space-y-6">

          {assessing ? (

              <div className="py-16 text-center">

                  <p className="text-lg font-semibold">
                      Analyzing your item...
                  </p>

                  <p className="text-gray-500 mt-2">
                      AI is identifying your item and estimating its details.
                  </p>

              </div>

          ) : (

              <>

                  <AIDetectedForm
                      context={context}
                      values={values}
                      onChange={setValues}
                  />

                  {error && (
                      <p className="text-sm text-red-500">
                          {error}
                      </p>
                  )}

                  <div className="space-y-3">

                      <PrimaryButton
                          onClick={handlePrimaryAction}
                          disabled={!canSubmit || submitting || assessing}
                      >
                          {submitting
                              ? "Submitting..."
                              : context === "posting"
                                  ? "Create Trade"
                                  : "Send Offer"}
                      </PrimaryButton>

                      <button
                          onClick={() => navigate(-1)}
                          className="w-full text-center text-sm text-gray-500 font-medium"
                      >
                          Retake Photo
                      </button>

                  </div>

              </>

          )}

      </div>
    </div>
  );
}
