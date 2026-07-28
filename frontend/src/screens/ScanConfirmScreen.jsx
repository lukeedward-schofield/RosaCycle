import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import AIDetectedForm from '../components/scan/AIDetectedForm';
import { MOCK_TRADE_AI_RESULT } from '../data/mockAiDetections';

export default function ScanConfirmScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const context = location.state?.context || 'posting';
  const tradeId = location.state?.tradeId;

  const [values, setValues] = useState(MOCK_TRADE_AI_RESULT);

  const handlePrimaryAction = () => {
    if (context === 'posting') {
      navigate('/trades/scan/created', { state: { trade: values } });
    } else {
      navigate(`/trades/${tradeId}/offer-sent`, { state: { offer: values } });
    }
  };

  return (
    <div className="pb-10">
      <Header onBack={() => navigate(-1)} title="Edit Details" />

      <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
        Captured photo preview
      </div>

      <div className="p-5 space-y-6">
        <AIDetectedForm context={context} values={values} onChange={setValues} />

        <div className="space-y-3">
          <PrimaryButton onClick={handlePrimaryAction}>
            {context === 'posting' ? 'Create Trade' : 'Send Offer'}
          </PrimaryButton>
          <button onClick={() => navigate(-1)} className="w-full text-center text-sm text-gray-500 font-medium">
            Retake Photo
          </button>
        </div>
      </div>
    </div>
  );
}
