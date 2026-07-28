import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationScreen from '../components/common/ConfirmationScreen';

export default function SpotReportedScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const spot = location.state?.spot;

  return (
    <ConfirmationScreen
      heading="Spot Reported!"
      subtext="Thanks for helping the community find this resource. It'll now show up as a pin on the map."
      summaryCard={
        spot && (
          <div>
            <p className="font-bold text-gray-900">{spot.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {spot.material}
              {spot.weightKg != null && ` • ${spot.weightKg}kg`}
              {spot.quantity != null && ` • ${spot.quantity} qty`}
            </p>
            {spot.description && <p className="text-sm text-gray-500 mt-1">{spot.description}</p>}
            {spot.permissionNote && (
              <p className="text-xs text-gray-400 mt-2">Access notes: {spot.permissionNote}</p>
            )}
          </div>
        )
      }
      primaryAction={{ label: 'View on Map', onClick: () => navigate('/map') }}
      secondaryAction={{ label: 'Report Another Spot', onClick: () => navigate('/camera') }}
    />
  );
}
