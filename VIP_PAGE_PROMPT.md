# AI Prompt: Create VIP Page for CIROOS Investment Platform

## Task
Create a comprehensive VIP page (`pages/vip.js`) that displays user's current VIP level, progress to next level, benefits per level, and how to upgrade.

---

## Page Requirements

### Route
- **Path:** `/vip`
- **File:** `pages/vip.js`

### Data Required
User data from `localStorage.getItem('user')`:
```javascript
{
  level: 0-5,              // Current VIP level
  total_invest_vip: 0,     // Total locked category investments (for VIP calculation)
  total_invest: 0,         // Total all investments
  name: "User Name",
  balance: 0
}
```

### VIP Thresholds
```javascript
const VIP_THRESHOLDS = {
  1: 50000,         // Rp 50.000
  2: 1200000,       // Rp 1.200.000
  3: 7000000,       // Rp 7.000.000
  4: 30000000,      // Rp 30.000.000
  5: 150000000      // Rp 150.000.000
};
```

---

## Page Layout Structure

### 1. Header Section
- Back button (arrow left)
- Page title: "VIP Status"
- User's current VIP level with animated crown icon

### 2. Current VIP Card (Highlight)
```
╔════════════════════════════════╗
║     🎉 VIP LEVEL SAAT INI 🎉   ║
╠════════════════════════════════╣
║                                ║
║          VIP {level}           ║
║        ⭐⭐⭐⭐⭐              ║
║                                ║
║  Progress ke VIP {next}:       ║
║  [████████░░░░░░░] 65%         ║
║                                ║
║  Investasi VIP: Rp xxx         ║
║  Butuh lagi: Rp xxx            ║
╚════════════════════════════════╝
```

**Features:**
- Large, prominent display of current level
- Stars animation (⭐ × level)
- Progress bar to next level
- Current invest_vip amount
- Remaining amount needed
- If level 5 (max): Show "VIP Maksimal!" celebration card

### 3. VIP Benefits Timeline

Vertical timeline showing all 5 VIP levels with:
- Level number & threshold
- Lock/Unlock indicator (based on user's current level)
- Benefits list per level
- Visual indicator for current level

```
Timeline Structure:

VIP 0 (Default) ✅ CURRENT
└─ No special benefits
   └─ Can buy Monitor products only

VIP 1 (Rp 50k) 🔓 UNLOCKED / 🔒 LOCKED
├─ Unlock: Insight 1
└─ Investment needed: Rp 50.000

VIP 2 (Rp 1.2M)
├─ Unlock: Insight 2
└─ Investment needed: Rp 1.200.000

VIP 3 (Rp 7M)
├─ Unlock: Insight 3
├─ Unlock: ALL AutoPilot products
└─ Investment needed: Rp 7.000.000

VIP 4 (Rp 30M)
├─ Unlock: Insight 4
└─ Investment needed: Rp 30.000.000

VIP 5 (Rp 150M) 👑 MAX LEVEL
├─ Unlock: Insight 5
└─ Investment needed: Rp 150.000.000
```

### 4. How to Upgrade Section

Card explaining:
- Only Monitor category investments count
- Insight/AutoPilot don't increase VIP level
- Benefits of higher VIP levels
- Call-to-action button to go to dashboard

```
╔════════════════════════════════╗
║     CARA NAIK LEVEL VIP        ║
╠════════════════════════════════╣
║ ✅ Investasi di produk Monitor ║
║    (Profit Terkunci)           ║
║                                ║
║ ❌ Investasi Insight/AutoPilot ║
║    TIDAK menambah VIP          ║
║                                ║
║ [LIHAT PRODUK MONITOR]         ║
╚════════════════════════════════╝
```

### 5. Product Unlocks (Optional Detail)

Show which products are unlocked at user's current level:
```
VIP {currentLevel} Products:
✅ Monitor: All products
✅ Insight 1, 2, 3
✅ AutoPilot: All products
🔒 Insight 4 (Need VIP 4)
🔒 Insight 5 (Need VIP 5)
```

---

## Design System

### Colors:
```javascript
VIP_COLORS = {
  0: { bg: 'gray', text: 'text-gray-400', gradient: 'from-gray-500 to-slate-500' },
  1: { bg: 'bronze', text: 'text-yellow-600', gradient: 'from-yellow-600 to-orange-600' },
  2: { bg: 'silver', text: 'text-gray-300', gradient: 'from-gray-400 to-gray-500' },
  3: { bg: 'gold', text: 'text-yellow-400', gradient: 'from-yellow-400 to-orange-500' },
  4: { bg: 'platinum', text: 'text-blue-300', gradient: 'from-blue-400 to-purple-500' },
  5: { bg: 'diamond', text: 'text-cyan-300', gradient: 'from-cyan-400 to-blue-500' }
}
```

### Icons:
- Crown: `mdi:crown` (VIP indicator)
- Lock: `mdi:lock` (Locked level)
- Unlock: `mdi:lock-open` (Unlocked level)
- Check: `mdi:check-circle` (Current level)
- Star: `mdi:star` (Level stars)
- Monitor: `mdi:monitor-dashboard`
- Insight: `mdi:lightbulb-on`
- AutoPilot: `mdi:rocket-launch`

### Animations:
- Fade in on mount
- Progress bar animate on load
- Crown icon pulse animation
- Smooth transitions between states

---

## Code Structure Template

```javascript
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { ArrowLeft } from 'lucide-react';
import BottomNavbar from '../components/BottomNavbar';

export default function VIPPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const VIP_THRESHOLDS = {
    1: 50000,
    2: 1200000,
    3: 7000000,
    4: 30000000,
    5: 150000000
  };
  
  const VIP_BENEFITS = {
    0: ['Akses produk Monitor'],
    1: ['Unlock Insight 1', 'Semua benefit VIP 0'],
    2: ['Unlock Insight 2', 'Semua benefit VIP 1'],
    3: ['Unlock Insight 3', 'Unlock ALL AutoPilot', 'Semua benefit VIP 2'],
    4: ['Unlock Insight 4', 'Semua benefit VIP 3'],
    5: ['Unlock Insight 5', 'SEMUA produk tersedia', 'VIP LEVEL TERTINGGI 👑']
  };
  
  useEffect(() => {
    // Load user data from localStorage
    // Calculate VIP progress
  }, []);
  
  const getVIPProgress = () => {
    // Same calculation as dashboard
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-32">
      {/* Background effects */}
      {/* Header with back button */}
      {/* Current VIP status card */}
      {/* VIP benefits timeline */}
      {/* How to upgrade section */}
      {/* Bottom navbar */}
    </div>
  );
}
```

---

## Specific Components to Include

### 1. VIP Level Badge (Large)
```jsx
<div className="text-center mb-6">
  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl px-8 py-4 shadow-2xl">
    <Icon icon="mdi:crown" className="w-10 h-10 text-white animate-pulse" />
    <div className="text-left">
      <p className="text-white/90 text-xs font-medium">Current Level</p>
      <p className="text-white text-3xl font-bold">VIP {level}</p>
    </div>
  </div>
  <p className="text-white/60 text-sm mt-3">{getVIPStars(level)}</p>
</div>
```

### 2. Progress to Next Level Card
```jsx
{nextLevel && (
  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-3xl p-6 border border-white/10">
    <h3>Progress ke VIP {nextLevel}</h3>
    <div className="progress-bar">{progress}%</div>
    <div className="grid grid-cols-2 gap-4">
      <div>Investasi VIP: {formatCurrency(totalInvestVIP)}</div>
      <div>Butuh Lagi: {formatCurrency(remaining)}</div>
    </div>
  </div>
)}
```

### 3. VIP Timeline Item
```jsx
<div className={`timeline-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}>
  <div className="timeline-marker">
    {isCurrent && <Icon icon="mdi:check-circle" className="text-green-400" />}
    {isUnlocked && !isCurrent && <Icon icon="mdi:lock-open" />}
    {!isUnlocked && <Icon icon="mdi:lock" className="text-gray-500" />}
  </div>
  
  <div className="timeline-content">
    <h4>VIP {level} {level === 5 && '👑'}</h4>
    <p className="threshold">Investment: {formatCurrency(threshold)}</p>
    
    <ul className="benefits">
      {VIP_BENEFITS[level].map(benefit => (
        <li key={benefit}>
          <Icon icon="mdi:check" /> {benefit}
        </li>
      ))}
    </ul>
  </div>
</div>
```

### 4. Upgrade CTA
```jsx
<button 
  onClick={() => router.push('/dashboard')}
  className="w-full bg-gradient-to-r from-[#F45D16] to-[#FF6B35] ..."
>
  <Icon icon="mdi:shopping" />
  Lihat Produk Monitor
</button>
```

---

## Interactive Features

### 1. Level Comparison
Show side-by-side comparison of current level vs next level benefits

### 2. Investment Calculator (Optional)
- Input field: "Berapa yang ingin diinvestasikan?"
- Output: "Anda akan naik ke VIP {x}"

### 3. Product Preview
- Show sample Monitor products that count toward VIP
- Click to go to dashboard with Monitor category pre-selected

---

## Mobile Responsive

- Stack cards vertically
- Touch-friendly buttons
- Swipeable timeline on mobile
- Collapsible benefit lists

---

## Data Flow

```javascript
// On page load
const user = JSON.parse(localStorage.getItem('user'));
const currentLevel = user.level || 0;
const totalInvestVIP = user.total_invest_vip || 0;

// Calculate progress
const nextLevel = currentLevel + 1;
const nextThreshold = VIP_THRESHOLDS[nextLevel];
const progress = (totalInvestVIP / nextThreshold) * 100;
const remaining = nextThreshold - totalInvestVIP;

// Determine which levels are unlocked
const unlockedLevels = Object.keys(VIP_THRESHOLDS).filter(
  level => totalInvestVIP >= VIP_THRESHOLDS[level]
);
```

---

## User Experience Flow

1. User opens `/vip` page
2. See big VIP level badge with animation
3. See progress bar to next level
4. Scroll down to see timeline of all levels
5. Understand which levels are locked/unlocked
6. Learn how to upgrade (Monitor products only)
7. Click CTA button to go to dashboard
8. (Optional) Share VIP status on social media

---

## Edge Cases to Handle

1. **VIP 0 (No investments yet)**
   - Show encouraging message
   - Highlight VIP 1 as first goal
   - Show minimum investment (Rp 50k)

2. **VIP 5 (Maximum level)**
   - Congratulations message
   - Show all unlocked benefits
   - No "next level" section
   - Badge: "VIP ULTIMATE 👑"

3. **Close to next level (>90% progress)**
   - Show motivational message
   - Highlight "Almost there!"
   - Suggest Monitor products

4. **Far from next level (<10% progress)**
   - Show realistic expectations
   - Break down into smaller goals
   - Show product suggestions

---

## Animation & Polish

### On Load:
- Fade in background
- Slide up main card
- Animate progress bar from 0 to current %
- Pulse crown icon

### Interactions:
- Hover effects on timeline items
- Expand/collapse benefit details
- Smooth scroll to section
- Confetti animation if level 5

### Transitions:
- Smooth page transitions
- Loading skeleton for user data
- Error state if data fetch fails

---

## Accessibility

- Semantic HTML (h1, h2, section, etc.)
- ARIA labels for progress bars
- Keyboard navigation
- Screen reader friendly
- High contrast mode support

---

## Example Code Snippets

### Calculate Next Level
```javascript
const getNextLevelInfo = (currentLevel, totalInvestVIP) => {
  if (currentLevel >= 5) {
    return {
      isMax: true,
      message: "Anda telah mencapai VIP level tertinggi!"
    };
  }
  
  const nextLevel = currentLevel + 1;
  const threshold = VIP_THRESHOLDS[nextLevel];
  const remaining = threshold - totalInvestVIP;
  const progress = (totalInvestVIP / threshold) * 100;
  
  return {
    isMax: false,
    nextLevel,
    threshold,
    remaining,
    progress: Math.min(progress, 100)
  };
};
```

### Format Currency
```javascript
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(amount);
};
```

### Get VIP Color
```javascript
const getVIPColor = (level) => {
  const colors = {
    0: 'from-gray-500 to-slate-600',
    1: 'from-yellow-700 to-orange-700',    // Bronze
    2: 'from-gray-400 to-gray-600',        // Silver
    3: 'from-yellow-400 to-orange-500',    // Gold
    4: 'from-blue-400 to-purple-600',      // Platinum
    5: 'from-cyan-400 to-blue-600'         // Diamond
  };
  return colors[level] || colors[0];
};
```

---

## Additional Features (Nice to Have)

### 1. Share VIP Status
Button to share on social media or copy link

### 2. VIP History
Timeline of when user achieved each level (requires API)

### 3. Leaderboard Preview
"Your rank: #123 out of 1000 VIP users"

### 4. Exclusive Content (Future)
- VIP-only announcements
- Special promotions for high VIP
- Direct support channel for VIP 4-5

---

## Technical Notes

- Use same design system as dashboard.js (colors, fonts, spacing)
- Reuse BottomNavbar component
- Use iconify/react for icons
- Responsive: max-w-md mx-auto
- Dark theme with gradient accents
- Loading skeleton while fetching user data

---

## Testing Checklist

- [ ] Displays correct current VIP level
- [ ] Progress bar calculates correctly
- [ ] Timeline shows all 5 levels
- [ ] Locked/unlocked indicators work
- [ ] VIP 0 shows appropriate message
- [ ] VIP 5 shows max level celebration
- [ ] Benefits list for each level
- [ ] CTA button navigates to dashboard
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Back button works
- [ ] Bottom navbar visible

---

## Success Criteria

✅ User immediately understands their current VIP level
✅ User knows exactly how much more they need to invest
✅ User understands only Monitor products count
✅ User can see all benefits per level
✅ Beautiful, professional UI consistent with app design
✅ Mobile-first, responsive design
✅ Smooth animations and transitions

---

## Example Output Format

The generated page should include:
1. Full page component (`pages/vip.js`)
2. Proper imports
3. State management
4. Helper functions
5. JSX structure
6. Inline styles (jsx global)
7. Complete and ready to use

---

**Start creating the VIP page now with all the requirements above!**

