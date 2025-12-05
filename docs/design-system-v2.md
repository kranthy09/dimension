# Portfolio Design System v2.0
## Energy & Evolution Theme

---

## 1. Color System

### CSS Variables (Root Configuration)

```css
:root {
  /* === ENERGY SPECTRUM (Orange) === */
  --energy-50: #fff7ed;
  --energy-100: #ffedd5;
  --energy-200: #fed7aa;
  --energy-300: #fdba74;
  --energy-400: #fb923c;
  --energy-500: #f97316;  /* Primary */
  --energy-600: #ea580c;
  --energy-700: #c2410c;
  --energy-800: #9a3412;
  --energy-900: #7c2d12;
  
  /* === LIFE SPECTRUM (Green) === */
  --life-50: #f0fdf4;
  --life-100: #dcfce7;
  --life-200: #bbf7d0;
  --life-300: #86efac;
  --life-400: #4ade80;
  --life-500: #22c55e;  /* Primary */
  --life-600: #16a34a;
  --life-700: #15803d;
  --life-800: #166534;
  --life-900: #14532d;
  
  /* === NEUTRAL SPECTRUM (Terracotta-inspired) === */
  --sand-50: #faf8f6;
  --sand-100: #f5f0eb;
  --sand-200: #e8ddd3;
  --sand-300: #d4bfaf;
  --sand-400: #b39a87;
  --sand-500: #8f7762;
  --sand-600: #6b5849;
  --sand-700: #4a3f35;
  --sand-800: #332b24;
  --sand-900: #1f1b17;
  
  /* === SEMANTIC COLORS === */
  --bg-primary: var(--sand-50);
  --bg-secondary: var(--sand-100);
  --text-primary: var(--sand-900);
  --text-secondary: var(--sand-700);
  --text-muted: var(--sand-500);
  --accent-primary: var(--energy-500);
  --accent-secondary: var(--life-500);
  --border: rgba(212, 191, 175, 0.3);
  --border-strong: rgba(212, 191, 175, 0.6);
  
  /* === GRADIENTS === */
  --gradient-energy: linear-gradient(135deg, var(--energy-500) 0%, var(--energy-700) 100%);
  --gradient-life: linear-gradient(135deg, var(--life-500) 0%, var(--life-700) 100%);
  --gradient-evolution: linear-gradient(135deg, var(--energy-500) 0%, var(--life-500) 100%);
  --gradient-subtle: linear-gradient(120deg, transparent 0%, rgba(249, 115, 22, 0.05) 100%);
  
  /* === SHADOWS === */
  --shadow-sm: 0 1px 2px rgba(122, 45, 18, 0.05);
  --shadow-md: 0 4px 6px rgba(122, 45, 18, 0.07), 0 2px 4px rgba(122, 45, 18, 0.06);
  --shadow-lg: 0 10px 15px rgba(122, 45, 18, 0.1), 0 4px 6px rgba(122, 45, 18, 0.05);
  --shadow-xl: 0 20px 25px rgba(122, 45, 18, 0.1), 0 8px 10px rgba(122, 45, 18, 0.04);
  --shadow-energy: 0 8px 20px rgba(249, 115, 22, 0.3);
  --shadow-life: 0 8px 20px rgba(34, 197, 94, 0.3);
}

/* Dark Mode */
[data-theme="dark"] {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  --text-primary: var(--sand-50);
  --text-secondary: var(--sand-300);
  --text-muted: var(--sand-500);
  --border: rgba(212, 191, 175, 0.15);
  --border-strong: rgba(212, 191, 175, 0.3);
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
  --shadow-energy: 0 8px 30px rgba(249, 115, 22, 0.4);
  --shadow-life: 0 8px 30px rgba(34, 197, 94, 0.4);
}
```

### Usage Guidelines

**Energy (Orange):**
- CTAs and primary actions
- Interactive elements on hover
- Loading states
- Highlights and attention-grabbing elements
- Progress indicators (start state)

**Life (Green):**
- Success states
- Completion indicators
- Growth-related content
- Secondary actions
- Progress indicators (end state)

**Neutral (Sand/Terracotta):**
- Backgrounds
- Text
- Borders
- Subtle UI elements

---

## 2. Typography

```css
/* Font Stack */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-display: 'Inter', sans-serif;
}

/* Type Scale */
:root {
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* Typography Classes */
.heading-1 {
  font-size: var(--text-6xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.heading-2 {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.01em;
}

.heading-3 {
  font-size: var(--text-4xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

.body-large {
  font-size: var(--text-xl);
  line-height: var(--leading-relaxed);
}

.body-base {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

.body-small {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--sand-100);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}
```

---

## 3. Spacing System

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

---

## 4. Animation System

### Easing Functions

```css
:root {
  /* Cubic Bezier Curves */
  --ease-organic: cubic-bezier(0.43, 0.13, 0.23, 0.96);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
}
```

### Core Animation Patterns

```css
/* Fade In Up */
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

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In Right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scale In */
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

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Ripple Effect */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Gradient Shift */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Grow Line */
@keyframes growLine {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* Bounce Scale */
@keyframes bounceScale {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Shake */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}
```

### Loading States

```css
/* Energy to Life Gradient Loader */
.loading-gradient {
  width: 100%;
  height: 4px;
  background: linear-gradient(
    90deg,
    var(--energy-500) 0%,
    var(--life-500) 50%,
    var(--energy-500) 100%
  );
  background-size: 200% 100%;
  animation: gradientShift 2s ease infinite;
}

/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--energy-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Pulsing Dot */
.loading-dot {
  width: 12px;
  height: 12px;
  background: var(--gradient-evolution);
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}
```

---

## 5. Component Patterns

### Buttons

```css
/* Base Button */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-smooth);
  overflow: hidden;
}

/* Primary Button (Energy) */
.btn-primary {
  background: var(--gradient-energy);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-energy);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button (Life) */
.btn-secondary {
  background: var(--gradient-life);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-life);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-strong);
}

.btn-ghost:hover {
  border-color: var(--energy-500);
  background: var(--gradient-subtle);
}

/* Ripple Effect on Click */
.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  opacity: 0;
  pointer-events: none;
}

.btn.active::after {
  animation: ripple 0.6s ease-out;
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

.card-interactive {
  cursor: pointer;
}

.card-interactive:active {
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--text-primary);
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

.input:focus::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  padding: 2px;
  background: var(--gradient-evolution);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Success State */
.input.success {
  border-color: var(--life-500);
}

/* Error State */
.input.error {
  border-color: var(--energy-700);
  animation: shake 0.5s ease-in-out;
}
```

### Progress Bars

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--sand-200);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-evolution);
  border-radius: 999px;
  transition: width var(--duration-slow) var(--ease-organic);
}

/* Animated shimmer effect */
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}
```

---

## 6. Navigation System

```css
/* Main Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(250, 248, 246, 0.8);
  border-bottom: 1px solid var(--border);
  transition: all var(--duration-base) var(--ease-smooth);
}

[data-theme="dark"] .nav {
  background: rgba(15, 15, 15, 0.8);
}

/* Scrolled state */
.nav.scrolled {
  box-shadow: var(--shadow-md);
  background: rgba(250, 248, 246, 0.95);
}

[data-theme="dark"] .nav.scrolled {
  background: rgba(15, 15, 15, 0.95);
}

/* Nav Links */
.nav-link {
  position: relative;
  padding: var(--space-4) var(--space-5);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: color var(--duration-base) var(--ease-smooth);
}

.nav-link:hover {
  color: var(--text-primary);
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

.nav-link:hover::before {
  width: 100%;
}

.nav-link.active::before {
  width: 100%;
}

/* Hover glow effect */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 6px;
  background: radial-gradient(ellipse, var(--life-500), transparent);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-smooth);
}

.nav-link:hover::after {
  opacity: 0.3;
}
```

---

## 7. Custom Cursor System

```css
/* Hide default cursor */
body {
  cursor: none;
}

body * {
  cursor: none;
}

/* Custom cursor */
.cursor {
  position: fixed;
  width: 12px;
  height: 12px;
  background: var(--energy-500);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transition: transform var(--duration-fast) var(--ease-smooth),
              background var(--duration-fast) var(--ease-smooth);
}

/* Cursor ring */
.cursor-ring {
  position: fixed;
  width: 40px;
  height: 40px;
  border: 2px solid var(--energy-500);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transition: width var(--duration-base) var(--ease-spring),
              height var(--duration-base) var(--ease-spring),
              border-color var(--duration-base) var(--ease-smooth);
}

/* Hover state */
.cursor.hover {
  transform: scale(1.5);
  background: var(--life-500);
}

.cursor-ring.hover {
  width: 60px;
  height: 60px;
  border-color: var(--life-500);
}

/* Click state */
.cursor.click {
  transform: scale(0.8);
}

.cursor-ring.click {
  width: 50px;
  height: 50px;
}

/* Text selection state */
.cursor.text {
  transform: scaleX(0.3) scaleY(1.5);
  border-radius: 20%;
}
```

---

## 8. Scroll Behavior

```css
html {
  scroll-behavior: smooth;
  scroll-snap-type: y proximity;
}

section {
  scroll-snap-align: start;
  scroll-snap-stop: normal;
}

/* Scroll progress indicator */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 3px;
  background: var(--gradient-evolution);
  z-index: 9999;
  transition: width 0.1s linear;
}
```

### Scroll-triggered Animations

```javascript
// Implementation pattern
const observerOptions = {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Apply to elements
document.querySelectorAll('.scroll-animate').forEach(el => {
  observer.observe(el);
});
```

```css
/* Scroll animation classes */
.scroll-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity var(--duration-slow) var(--ease-organic),
              transform var(--duration-slow) var(--ease-organic);
}

.scroll-animate.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.scroll-animate-stagger > * {
  opacity: 0;
  transform: translateY(20px);
}

.scroll-animate-stagger.animate-in > * {
  animation: fadeInUp var(--duration-slow) var(--ease-organic) forwards;
}

.scroll-animate-stagger.animate-in > *:nth-child(1) { animation-delay: 0ms; }
.scroll-animate-stagger.animate-in > *:nth-child(2) { animation-delay: 100ms; }
.scroll-animate-stagger.animate-in > *:nth-child(3) { animation-delay: 200ms; }
.scroll-animate-stagger.animate-in > *:nth-child(4) { animation-delay: 300ms; }
.scroll-animate-stagger.animate-in > *:nth-child(5) { animation-delay: 400ms; }
```

---

## 9. Page Transitions

### React/Next.js Pattern

```javascript
// Framer Motion configuration
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

// Component wrapper
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="enter"
  exit="exit"
>
  {children}
</motion.div>
```

### CSS-only Fallback

```css
.page-enter {
  opacity: 0;
  transform: translateX(-20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity var(--duration-slow) var(--ease-organic),
              transform var(--duration-slow) var(--ease-organic);
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.4s var(--ease-organic),
              transform 0.4s var(--ease-organic);
}
```

---

## 10. Theme Toggle

```css
/* Theme Toggle Button */
.theme-toggle {
  position: relative;
  width: 60px;
  height: 32px;
  background: var(--sand-200);
  border-radius: 999px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: background var(--duration-base) var(--ease-smooth);
}

.theme-toggle:hover {
  background: var(--sand-300);
}

/* Toggle Circle */
.theme-toggle-circle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: var(--energy-500);
  border-radius: 50%;
  transition: transform var(--duration-base) var(--ease-spring),
              background var(--duration-base) var(--ease-smooth);
  box-shadow: var(--shadow-md);
}

/* Dark mode active */
[data-theme="dark"] .theme-toggle-circle {
  transform: translateX(28px);
  background: var(--life-500);
}

/* Icon inside circle */
.theme-toggle-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
```

```javascript
// Theme toggle implementation
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Add rotation animation to toggle
  const toggle = document.querySelector('.theme-toggle-circle');
  toggle.style.transform += ' rotate(360deg)';
  
  setTimeout(() => {
    toggle.style.transform = toggle.style.transform.replace(' rotate(360deg)', '');
  }, 300);
};
```

---

## 11. Mouse Movement Parallax

```javascript
// Velocity-based parallax
let mouseX = 0;
let mouseY = 0;
let prevMouseX = 0;
let prevMouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateParallax() {
  const deltaX = mouseX - prevMouseX;
  const deltaY = mouseY - prevMouseY;
  const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  
  // Update parallax layers
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.5;
    const x = (mouseX - window.innerWidth / 2) * speed * 0.02;
    const y = (mouseY - window.innerHeight / 2) * speed * 0.02;
    
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  
  requestAnimationFrame(updateParallax);
}

updateParallax();
```

### HTML Usage

```html
<!-- Parallax layers -->
<div data-parallax="0.2" class="bg-shape"></div>
<div data-parallax="0.5" class="content"></div>
<div data-parallax="0.8" class="foreground"></div>
```

---

## 12. Micro-interactions

### Success Checkmark

```css
.success-check {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--gradient-life);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounceScale 0.6s var(--ease-bounce);
}

.success-check::before {
  content: '✓';
  color: white;
  font-size: 32px;
  font-weight: bold;
}
```

### Error Notification

```css
.error-notification {
  background: var(--energy-700);
  color: white;
  padding: var(--space-4) var(--space-6);
  border-radius: 8px;
  box-shadow: var(--shadow-energy);
  animation: shake 0.5s ease-in-out, fadeIn 0.3s ease-out;
}
```

### Loading Skeleton

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--sand-200) 25%,
    var(--sand-100) 50%,
    var(--sand-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
}
```

### Tooltip

```css
.tooltip {
  position: relative;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: var(--space-2) var(--space-3);
  background: var(--sand-900);
  color: white;
  font-size: var(--text-sm);
  white-space: nowrap;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-base) var(--ease-smooth),
              transform var(--duration-base) var(--ease-smooth);
}

.tooltip:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

---

## 13. Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First Approach */
@media (min-width: 640px) {
  /* sm */
}

@media (min-width: 768px) {
  /* md */
}

@media (min-width: 1024px) {
  /* lg */
}

@media (min-width: 1280px) {
  /* xl */
}

@media (min-width: 1536px) {
  /* 2xl */
}
```

---

## 14. Accessibility

```css
/* Focus visible (keyboard navigation) */
:focus-visible {
  outline: 2px solid var(--energy-500);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  html {
    scroll-behavior: auto;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --border: rgba(0, 0, 0, 0.5);
    --border-strong: rgba(0, 0, 0, 0.8);
  }
  
  [data-theme="dark"] {
    --border: rgba(255, 255, 255, 0.5);
    --border-strong: rgba(255, 255, 255, 0.8);
  }
}
```

---

## 15. Utility Classes

```css
/* Display */
.hidden { display: none; }
.flex { display: flex; }
.grid { display: grid; }
.inline-flex { display: inline-flex; }

/* Flexbox */
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-col { flex-direction: column; }
.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }

/* Positioning */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

/* Sizing */
.w-full { width: 100%; }
.h-full { height: 100%; }
.w-screen { width: 100vw; }
.h-screen { height: 100vh; }

/* Spacing */
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }
.m-4 { margin: var(--space-4); }
.mx-auto { margin-left: auto; margin-right: auto; }

/* Text */
.text-center { text-align: center; }
.font-bold { font-weight: var(--font-bold); }
.uppercase { text-transform: uppercase; }

/* Colors */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.bg-primary { background: var(--bg-primary); }
.bg-secondary { background: var(--bg-secondary); }

/* Borders */
.rounded { border-radius: 8px; }
.rounded-lg { border-radius: 12px; }
.rounded-full { border-radius: 999px; }

/* Shadows */
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }

/* Interactive */
.cursor-pointer { cursor: pointer; }
.select-none { user-select: none; }
.pointer-events-none { pointer-events: none; }

/* Overflow */
.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }
```

---

## 16. Implementation Checklist

### Phase 1: Foundation
- [ ] Set up CSS variables (colors, typography, spacing)
- [ ] Implement theme toggle system
- [ ] Add font imports
- [ ] Set up base styles
- [ ] Create utility classes

### Phase 2: Components
- [ ] Build button variants
- [ ] Create card components
- [ ] Implement input/form styles
- [ ] Add navigation component
- [ ] Build progress indicators

### Phase 3: Animations
- [ ] Add scroll-triggered animations
- [ ] Implement page transitions
- [ ] Create loading states
- [ ] Add hover effects
- [ ] Build micro-interactions

### Phase 4: Advanced Features
- [ ] Implement custom cursor
- [ ] Add mouse parallax effect
- [ ] Create scroll progress indicator
- [ ] Build tooltip system
- [ ] Add keyboard navigation focus states

### Phase 5: Polish
- [ ] Test all animations in reduced-motion mode
- [ ] Verify color contrast ratios
- [ ] Test keyboard navigation
- [ ] Optimize performance
- [ ] Cross-browser testing

---

## 17. Performance Guidelines

**Critical CSS**: Inline critical styles for above-the-fold content

**Animation Performance**:
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly for heavy animations

```css
.will-animate {
  will-change: transform, opacity;
}

.will-animate.complete {
  will-change: auto;
}
```

**Lazy Load Animations**: Only apply scroll animations to visible elements

**Debounce Scroll/Mouse Events**: Use `requestAnimationFrame` for smooth updates

---

## Usage Examples

### Hero Section

```html
<section class="hero scroll-animate">
  <h1 class="heading-1" style="background: var(--gradient-evolution); -webkit-background-clip: text; background-clip: text; color: transparent;">
    Energy meets Evolution
  </h1>
  <p class="body-large text-secondary">
    Building the future with clean, powerful code
  </p>
  <button class="btn btn-primary">
    Explore Projects
  </button>
</section>
```

### Project Card

```html
<div class="card card-interactive scroll-animate">
  <h3 class="heading-3">Project Name</h3>
  <p class="body-base text-secondary">Description...</p>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 75%"></div>
  </div>
</div>
```

---

This design system provides a complete, consistent foundation for implementing the energy-evolution theme across your entire portfolio.
