const fs = require('fs'); 
let c = fs.readFileSync('frontend/components/landing/LandingSections.tsx', 'utf8'); 
const heroStart = c.indexOf('export function HeroSection'); 
const heroEnd = c.indexOf('export function ProblemSection'); 
let heroStr = c.substring(heroStart, heroEnd); 

heroStr = heroStr.replace(/UI\.surfaceInverse/g, 'LegacyUI.surfaceInverse')
                 .replace(/UI\.accent/g, 'LegacyUI.accent')
                 .replace(/UI\.fg40/g, 'LegacyUI.fg40')
                 .replace('Trust the journey.', 'The search engine for')
                 .replace('Find your path.', 'human experiences.');

const newButton = `<TouchableOpacity 
          onPress={onPressGoogle}
          style={{ 
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: LegacyUI.accent,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 32,
            width: '100%',
            gap: 12
          }}
          activeOpacity={0.8}
        >
          <Image 
            source={require('../../assets/google.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
          <Text style={{ 
            color: '#FFFFFF',
            fontSize: 16,
            fontFamily: 'Inter_600SemiBold'
          }}>
            Sign in with Google
          </Text>
        </TouchableOpacity>`;

const regex = /<GradientButton[\s\S]*?\/>/g;
heroStr = heroStr.replace(regex, newButton);

c = c.substring(0, heroStart) + heroStr + c.substring(heroEnd); 
fs.writeFileSync('frontend/components/landing/LandingSections.tsx', c);
console.log('Update complete');
