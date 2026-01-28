# Mobile Responsive Implementation

Mobile-first responsive design with hamburger navigation and touch optimization.

## Implemented Features

**Navigation:**
- Hamburger menu (< 1024px)
- Slide-out drawer from right
- Auto-close on route change
- 44px minimum touch targets

**Breakpoints:**
- Mobile: 0-767px (1 column)
- Tablet: 768-1023px (2 columns)
- Desktop: 1024px+ (full layout)

**Safe Area Support:**
- iOS notch/Dynamic Island support
- Uses `env(safe-area-inset-*)`

**Performance:**
- Reduced animations on mobile
- Smaller background orbs
- Conditional rendering

## File Structure
```
frontend/src/
├── store/useResponsiveStore.ts
├── hooks/useResponsive.ts
├── components/
│   ├── responsive/MobileOnly.tsx
│   ├── layout/MobileNav.tsx
│   └── layout/HamburgerButton.tsx
```

## Usage
```tsx
import { useResponsive } from '@/hooks/useResponsive'

function MyComponent() {
  const { isMobile } = useResponsive()
  return isMobile ? <MobileView /> : <DesktopView />
}
```

## Patterns
```tsx
className="p-4 sm:p-6 lg:p-8"  // Mobile-first
className="hidden lg:flex"      // Desktop only
className="lg:hidden"           // Mobile only
className="grid grid-cols-1 md:grid-cols-2"  // Responsive grid
```
