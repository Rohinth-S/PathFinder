const fs = require('fs');
let c = fs.readFileSync('frontend/components/landing/LandingSections.tsx', 'utf8');

const legacyUiDef = `import { UI, L } from '../../constants/colors';

const LegacyUI = {
  ...UI,
  accent: '#FF6900',
  accentEnd: '#FF4500',
  accentTint: 'rgba(255, 105, 0, 0.10)',
  accentSoft: 'rgba(255, 105, 0, 0.06)'
};`;

c = c.replace(/import \{ UI, L \} from '\.\.\/\.\.\/constants\/colors';/, legacyUiDef);

// Replace UI. with LegacyUI. BEFORE HeroSection
const heroSplit = c.split('export function HeroSection');
heroSplit[0] = heroSplit[0].replace(/UI\./g, 'LegacyUI.');

// Replace UI. with LegacyUI. AFTER HeroSection
const problemSplit = heroSplit[1].split('export function ProblemSection');
problemSplit[1] = problemSplit[1].replace(/UI\./g, 'LegacyUI.');

heroSplit[1] = problemSplit.join('export function ProblemSection');
c = heroSplit.join('export function HeroSection');

fs.writeFileSync('frontend/components/landing/LandingSections.tsx', c);
