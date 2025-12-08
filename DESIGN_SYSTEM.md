# Design System

Energy & Evolution theme with orange-green gradient palette, organic animations, and terracotta-inspired neutrals.

---

## Color Palette

### Primary Colors

**Energy (Orange)** - Action, vitality, attention
```css
--energy-500: #f97316  /* Primary */
--energy-600: #ea580c  /* Hover */
--energy-700: #c2410c  /* Active */
```

**Life (Green)** - Growth, success, completion
```css
--life-500: #22c55e   /* Primary */
--life-600: #16a34a   /* Hover */
--life-700: #15803d   /* Active */
```

### Neutral Colors (Terracotta-inspired)

**Sand Spectrum** - Backgrounds, text, borders
```css
--sand-50: #faf8f6    /* Light background */
--sand-100: #f5f0eb   /* Secondary background */
--sand-200: #e8ddd3   /* Subtle borders */
--sand-300: #d4bfaf   /* Borders */
--sand-500: #8f7762   /* Muted text */
--sand-700: #4a3f35   /* Secondary text */
--sand-900: #1f1b17   /* Primary text */
```

### Semantic Colors

```css
--bg-primary: var(--sand-50)
--bg-secondary: var(--sand-100)
--text-primary: var(--sand-900)
--text-secondary: var(--sand-700)
--text-muted: var(--sand-500)
--accent-primary: var(--energy-500)
--accent-secondary: var(--life-500)
--border: rgba(212, 191, 175, 0.3)
```

### Gradients

```css
--gradient-energy: linear-gradient(135deg, #f97316 0%, #c2410c 100%)
--gradient-life: linear-gradient(135deg, #22c55e 0%, #15803d 100%)
--gradient-evolution: linear-gradient(135deg, #f97316 0%, #22c55e 100%)
--gradient-subtle: linear-gradient(120deg, transparent 0%, rgba(249, 115, 22, 0.05) 100%)
```

**Usage**:
- Energy: CTAs, primary actions, loading start state
- Life: Success states, completion indicators, loading end state
- Evolution: Progress bars, transitions, hero elements
- Subtle: Hover states, background accents

### Dark Mode

```css
[data-theme="dark"] {
  --bg-primary: #0f0f0f
  --bg-secondary: #1a1a1a
  --text-primary: var(--sand-50)
  --text-secondary: var(--sand-300)
  --border: rgba(212, 191, 175, 0.15)
}
```

---

## Typography

### Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace
--font-display: 'Inter', sans-serif
```

### Type Scale

```css
--text-xs: 0.75rem    /* 12px - captions */
--text-sm: 0.875rem   /* 14px - small text */
--text-base: 1rem     /* 16px - body */
--text-lg: 1.125rem   /* 18px - large body */
--text-xl: 1.25rem    /* 20px - subheadings */
--text-2xl: 1.5rem    /* 24px - h3 */
--text-3xl: 1.875rem  /* 30px - h2 */
--text-4xl: 2.25rem   /* 36px - h1 mobile */
--text-5xl: 3rem      /* 48px - h1 */
--text-6xl: 3.75rem   /* 60px - hero */
```

### Text Styles

**Headings**:
```css
.heading-1 {
  font-size: clamp(2.5rem, 5vw, 4rem);  /* Responsive */
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.heading-2 {
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: 1.25;
}

.heading-3 {
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1.3;
}
```

**Body**:
```css
.body-large {
  font-size: var(--text-xl);
  line-height: 1.75;
}

.body-base {
  font-size: var(--text-base);
  line-height: 1.5;
}

.body-small {
  font-size: var(--text-sm);
  line-height: 1.5;
}
```

**Code**:
```css
.code-inline {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--sand-100);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}
```

---

## Spacing System

```css
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px - base */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
--space-20: 5rem      /* 80px */
--space-24: 6rem      /* 96px */
--space-32: 8rem      /* 128px */
```

**Usage Pattern**:
- Inner padding: 4, 6
- Section padding: 12, 16, 20
- Component gaps: 2, 4, 6
- Large gaps: 8, 10, 12

---

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(122, 45, 18, 0.05)
--shadow-md: 0 4px 6px rgba(122, 45, 18, 0.07), 0 2px 4px rgba(122, 45, 18, 0.06)
--shadow-lg: 0 10px 15px rgba(122, 45, 18, 0.1), 0 4px 6px rgba(122, 45, 18, 0.05)
--shadow-xl: 0 20px 25px rgba(122, 45, 18, 0.1), 0 8px 10px rgba(122, 45, 18, 0.04)
--shadow-energy: 0 8px 20px rgba(249, 115, 22, 0.3)
--shadow-life: 0 8px 20px rgba(34, 197, 94, 0.3)
```

**Usage**:
- sm: Buttons at rest, subtle cards
- md: Cards, dropdowns
- lg: Modals, floating elements
- xl: Hero cards, featured content
- energy: Energy button hover
- life: Success states

---

## Animation System

### Timing Functions

```css
--ease-organic: cubic-bezier(0.43, 0.13, 0.23, 0.96)
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Durations

```css
--duration-fast: 150ms
--duration-base: 300ms
--duration-slow: 500ms
--duration-slower: 700ms
```

### Core Animations

**Fade In Up** (page elements):
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Scale In** (modals, cards):
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Gradient Shift** (loading states):
```css
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**Shimmer** (skeleton loaders):
```css
@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}
```

---

## Component Patterns

### Buttons

**Primary** (Energy gradient):
```css
.btn-primary {
  background: var(--gradient-energy);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: 500;
  transition: all var(--duration-base) var(--ease-smooth);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-energy);
}
```

**Secondary** (Life gradient):
```css
.btn-secondary {
  background: var(--gradient-life);
  /* Same style as primary */
}
```

**Ghost** (Transparent with border):
```css
.btn-ghost {
  background: transparent;
  border: 2px solid var(--border-strong);
  color: var(--text-primary);
}

.btn-ghost:hover {
  border-color: var(--energy-500);
  background: var(--gradient-subtle);
}
```

### Cards

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-base) var(--ease-smooth);
}

.card:hover {
  border-color: var(--energy-500);
  box-shadow: var(--shadow-lg);
  background: var(--gradient-subtle);
  transform: translateY(-4px);
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-primary);
  border: 2px solid var(--border);
  border-radius: 8px;
  transition: all var(--duration-base) var(--ease-smooth);
}

.input:focus {
  outline: none;
  border-color: var(--energy-500);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.input.error {
  border-color: var(--energy-700);
  animation: shake 0.5s ease-in-out;
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 500;
}

.badge-default {
  background: var(--energy-500);
  color: white;
}

.badge-outline {
  border: 1px solid var(--border-strong);
  background: transparent;
}

.badge-subtle {
  background: var(--sand-100);
  color: var(--text-secondary);
}
```

---

## Layout Components

### Navigation

```css
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(250, 248, 246, 0.8);
  border-bottom: 1px solid var(--border);
  z-index: 1000;
}

.nav-link {
  position: relative;
  padding: var(--space-4) var(--space-5);
  color: var(--text-secondary);
  transition: color var(--duration-base);
}

/* Active indicator */
.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--energy-500);
  transition: width var(--duration-base) var(--ease-organic);
}

.nav-link:hover::before,
.nav-link.active::before {
  width: 100%;
}
```

### Container

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding: 0 var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--space-8);
  }
}
```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm - tablets */ }
@media (min-width: 768px)  { /* md - small laptops */ }
@media (min-width: 1024px) { /* lg - desktops */ }
@media (min-width: 1280px) { /* xl - large desktops */ }
@media (min-width: 1536px) { /* 2xl - wide screens */ }
```

---

## Accessibility

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--energy-500);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

All text meets WCAG AA standards:
- Large text (18px+): 3:1 minimum
- Normal text: 4.5:1 minimum
- UI components: 3:1 minimum

---

## Usage Examples

### Hero Section

```html
<section class="hero">
  <h1 style="background: var(--gradient-evolution);
             -webkit-background-clip: text;
             background-clip: text;
             color: transparent;">
    Energy meets Evolution
  </h1>
  <p class="body-large text-secondary">
    Building powerful solutions
  </p>
  <button class="btn btn-primary">
    Get Started
  </button>
</section>
```

### Content Card

```html
<div class="card">
  <span class="badge badge-outline">Technology</span>
  <h3 class="heading-3">Article Title</h3>
  <p class="body-base text-secondary">Summary text...</p>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 75%"></div>
  </div>
</div>
```

### Form Input

```html
<div>
  <label class="text-sm font-medium">Email</label>
  <input type="email" class="input" />
  <span class="text-xs text-muted">We'll never share your email.</span>
</div>
```

---

## Theme Philosophy

**Energy** (Orange) represents:
- Action and momentum
- Technical skill
- Innovation

**Life** (Green) represents:
- Growth and learning
- Sustainable solutions
- Success

**Evolution** (Gradient) represents:
- Progress over time
- Transformation
- Journey from idea to reality

**Terracotta** (Sand tones) represents:
- Warmth and approachability
- Natural, organic feel
- Professional subtlety

---

This design system provides a cohesive, accessible, and performant foundation for the entire portfolio application.
