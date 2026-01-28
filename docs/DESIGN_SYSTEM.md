# Design System

Energy & Evolution theme with orange-green gradients and terracotta neutrals.

## Colors

**Primary:**
- Energy (Orange): `#f97316` - Action, vitality
- Life (Green): `#22c55e` - Growth, success
- Sand (Neutral): `#faf8f6` to `#1f1b17` - Backgrounds, text

**Gradients:**
```css
--gradient-energy: linear-gradient(135deg, #f97316, #c2410c)
--gradient-evolution: linear-gradient(135deg, #f97316, #22c55e)
```

## Typography
- Font: Inter (sans), JetBrains Mono (code)
- Scale: 0.75rem → 3.75rem
- Fluid sizing: `clamp(2.5rem, 5vw, 4rem)`

## Spacing
- Base: 1rem (16px)
- Range: 0.25rem → 8rem
- Pattern: 4, 6 (inner) | 12, 16, 20 (sections)

## Components

**Button:**
```css
.btn-primary {
  background: var(--gradient-energy);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: 300ms;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
}
```

**Card:**
```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}
.card:hover {
  border-color: var(--energy-500);
  transform: translateY(-4px);
}
```

## Animations
- Durations: 150ms (fast), 300ms (base), 500ms (slow)
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Keyframes: fadeInUp, scaleIn, gradientShift

## Responsive
- Mobile first: `640px` (sm), `768px` (md), `1024px` (lg)
- Container: max-width 1280px
