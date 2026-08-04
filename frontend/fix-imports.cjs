const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');

const MAP = {
  AuthContext: 'features/auth/AuthContext',
  SignInScreen: 'features/auth/screens/SignInScreen',
  SignUpScreen: 'features/auth/screens/SignUpScreen',
  EditProfileScreen: 'features/profile/screens/EditProfileScreen',
  TradesScreen: 'features/trades/screens/TradesScreen',
  TradeDetailScreen: 'features/trades/screens/TradeDetailScreen',
  EditListingScreen: 'features/trades/screens/EditListingScreen',
  ViewOfferScreen: 'features/trades/screens/ViewOfferScreen',
  TradeCreatedScreen: 'features/trades/screens/TradeCreatedScreen',
  OfferSentScreen: 'features/trades/screens/OfferSentScreen',
  MessageThreadScreen: 'features/trades/screens/MessageThreadScreen',
  RateTraderScreen: 'features/trades/screens/RateTraderScreen',
  TradeCard: 'features/trades/components/cards/TradeCard',
  EcoImpactBox: 'features/trades/components/trade/EcoImpactBox',
  FilterChipRow: 'features/trades/components/trade/FilterChipRow',
  MessageThread: 'features/trades/components/trade/MessageThread',
  ScanScreen: 'features/scan/screens/ScanScreen',
  ScanConfirmScreen: 'features/scan/screens/ScanConfirmScreen',
  AIDetectedForm: 'features/scan/components/AIDetectedForm',
  CameraViewfinder: 'features/scan/components/CameraViewfinder',
  MapScreen: 'features/map/screens/MapScreen',
  ResourceSpotScreen: 'features/map/screens/ResourceSpotScreen',
  ResourceSpotConfirmScreen: 'features/map/screens/ResourceSpotConfirmScreen',
  SpotReportedScreen: 'features/map/screens/SpotReportedScreen',
  geo: 'features/map/geo',
  Header: 'shared/components/layout/Header',
  BottomNav: 'shared/components/layout/BottomNav',
  UserMenu: 'shared/components/layout/UserMenu',
  ConfirmationScreen: 'shared/components/common/ConfirmationScreen',
  FloatingActionButton: 'shared/components/common/FloatingActionButton',
  Logo: 'shared/components/common/Logo',
  MaterialTag: 'shared/components/common/MaterialTag',
  PasswordInput: 'shared/components/common/PasswordInput',
  PrimaryButton: 'shared/components/common/PrimaryButton',
  SearchBar: 'shared/components/common/SearchBar',
  SecondaryButton: 'shared/components/common/SecondaryButton',
  StarRating: 'shared/components/common/StarRating',
  StatusPill: 'shared/components/common/StatusPill',
  api: 'shared/services/api',
  storageKeys: 'shared/lib/storageKeys',
  pendingCapture: 'shared/lib/pendingCapture',
  constants: 'shared/utils/constants',
  tradeFormat: 'shared/utils/tradeFormat',
  'logo.svg': 'assets/logo.svg',
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(SRC);
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(
    /from\s+['"](\.\.?\/[^'"]+)['"]/g,
    (match, importPath) => {
      const base = path.basename(importPath);
      const key = MAP[base] !== undefined ? base : base.replace(/\.(jsx?|tsx?)$/, '');
      if (MAP[key] !== undefined) {
        changed = true;
        totalChanges++;
        return `from '@/${MAP[key]}'`;
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', path.relative(SRC, file));
  }
}

console.log(`\nDone. ${totalChanges} import(s) rewritten across ${files.length} files.`);