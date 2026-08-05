import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';

import SignInScreen from '@/features/auth/screens/SignInScreen';
import SignUpScreen from '@/features/auth/screens/SignUpScreen';
import ConfirmDetailsScreen from '@/features/auth/screens/ConfirmDetailsScreen';
import EditProfileScreen from '@/features/profile/screens/EditProfileScreen';
import TradesScreen from '@/features/trades/screens/TradesScreen';
import TradeDetailScreen from '@/features/trades/screens/TradeDetailScreen';
import EditListingScreen from '@/features/trades/screens/EditListingScreen';
import ViewOfferScreen from '@/features/trades/screens/ViewOfferScreen';
import ScanScreen from '@/features/scan/screens/ScanScreen';
import ScanConfirmScreen from '@/features/scan/screens/ScanConfirmScreen';
import TradeCreatedScreen from '@/features/trades/screens/TradeCreatedScreen';
import OfferSentScreen from '@/features/trades/screens/OfferSentScreen';
import MessageThreadScreen from '@/features/trades/screens/MessageThreadScreen';
import ResourceSpotScreen from '@/features/map/screens/ResourceSpotScreen';
import ResourceSpotConfirmScreen from '@/features/map/screens/ResourceSpotConfirmScreen';
import SpotReportedScreen from '@/features/map/screens/SpotReportedScreen';
import MapScreen from '@/features/map/screens/MapScreen';
import RateTraderScreen from '@/features/trades/screens/RateTraderScreen';


// Gate for screens that require a signed-in user; bounces to /signin otherwise.
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

/**
 * FINAL nav structure (confirmed by team): 3 bottom tabs.
 * - /trades  -> Trades (Browse + My Trades internal sub-tabs)
 * - /camera  -> Camera / Resource Spot report (pins the Map, NOT a Trade)
 * - /map     -> Map (view-only pinned resource spot reports)
 *
 * Item scanning for a Trade (post or offer) is a *separate* flow at
 * /trades/scan — only reached from within Trades, never from the bottom nav.
 * Rate Trader is intentionally NOT a tab — reached only after a completed trade.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/trades" replace />} />

          {/* Auth (email + password) */}
          <Route path="/signin" element={<SignInScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/confirm-details" element={<RequireAuth><ConfirmDetailsScreen /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><EditProfileScreen /></RequireAuth>} />

          {/* Trades (Browse + My Trades) */}
          <Route path="/trades" element={<RequireAuth><TradesScreen /></RequireAuth>} />
          {/* AI item scan, for posting a new trade or sending an offer on an existing one */}
          <Route path="/trades/scan" element={<RequireAuth><ScanScreen /></RequireAuth>} />
          <Route path="/trades/scan/confirm" element={<RequireAuth><ScanConfirmScreen /></RequireAuth>} />
          <Route path="/trades/scan/created" element={<RequireAuth><TradeCreatedScreen /></RequireAuth>} />
          <Route path="/trades/:id" element={<RequireAuth><TradeDetailScreen /></RequireAuth>} />
          <Route path="/trades/:id/edit" element={<RequireAuth><EditListingScreen /></RequireAuth>} />
          <Route path="/trades/:id/my-offer" element={<RequireAuth><ViewOfferScreen /></RequireAuth>} />
          <Route path="/trades/:id/offer-sent" element={<RequireAuth><OfferSentScreen /></RequireAuth>} />
          <Route path="/trades/:id/messages" element={<RequireAuth><MessageThreadScreen /></RequireAuth>} />

          {/* Camera tab: report a Resource Spot, pins the Map — not a Trade */}
          <Route path="/camera" element={<RequireAuth><ResourceSpotScreen /></RequireAuth>} />
          <Route path="/camera/confirm" element={<RequireAuth><ResourceSpotConfirmScreen /></RequireAuth>} />
          <Route path="/camera/reported" element={<RequireAuth><SpotReportedScreen /></RequireAuth>} />

          {/* Map (view-only pinned resource spot reports) */}
          <Route path="/map" element={<RequireAuth><MapScreen /></RequireAuth>} />

          {/* Rate Trader (one-off, reached after a completed trade) */}
          <Route path="/rate/:tradeId" element={<RequireAuth><RateTraderScreen /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/trades" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
