# Pathfinder World Tracker Design System

This document outlines the design system for the Pathfinder World Tracker application, ensuring consistency across all UI components.

## Color Palette

```css
--bg-dark: #1a1a1a;      /* Main background color */
--bg-card: #2a2a2a;      /* Card and form control background */
--text: #f0f0f0;         /* Main text color */
--accent: #ff6b35;       /* Primary accent color */
--accent-light: #ff9e7a; /* Lighter accent for hover states */
--border-light: #3a3a3a; /* Light border color */
--radius: 0.5rem;        /* Border radius for components */
```

## Typography

- **Font Family**: 'Roboto', 'Segoe UI', sans-serif
- **Base Font Size**: 16px
- **Heading Sizes**:
  - H1: 2.5rem
  - H2: 2rem
  - H3: 1.75rem
  - H4: 1.5rem
  - H5: 1.25rem
  - H6: 1rem

## Components

### Cards

Cards are used to group related content and provide visual separation.

```html
<div class="card shadow-accent">
  <div class="card-header bg-card">
    <h5 class="mb-0 text-accent">Card Title</h5>
  </div>
  <div class="card-body bg-card">
    Card content goes here
  </div>
</div>
```

### Buttons

Buttons use the accent color with white text for optimal visibility.

```html
<button class="btn btn-accent">Primary Action</button>
<button class="btn btn-outline-accent">Secondary Action</button>
```

### Form Controls

Form controls use the card background with light text.

```html
<input type="text" class="form-control bg-card text" placeholder="Enter text">
<select class="form-select bg-card text">
  <option>Select an option</option>
</select>
```

### Badges

Badges use semantic colors based on their context.

```html
<span class="badge bg-primary">Primary</span>
<span class="badge bg-success">Success</span>
<span class="badge bg-warning">Warning</span>
<span class="badge bg-danger">Danger</span>
<span class="badge bg-info">Info</span>
<span class="badge bg-secondary">Secondary</span>
<span class="badge bg-accent">Accent</span>
```

### List Items

List items use card styling with accent borders.

```html
<div class="list-group-item bg-card text border-accent">
  List item content
</div>
```

## Utility Classes

### Spacing

- **Margin**: `m-1` through `m-5`
- **Padding**: `p-1` through `p-5`
- **Gap**: `gap-1` through `gap-5`

### Width

- **Max Width**: `max-w-100`, `max-w-200`, `max-w-300`, `max-w-400`, `max-w-500`

### Visibility

- **Display**: `d-none`, `d-block`, `d-flex`, `d-inline`, `d-inline-block`

## Implementation Guidelines

1. **Global Styling**: All styling should be defined in the global CSS file (`main.css`) and not inline or in component-specific CSS files.

2. **Dark Theme**: All components should use the dark theme color palette for consistency.

3. **Text Visibility**: Always ensure text has sufficient contrast against its background.

4. **Responsive Design**: Use Bootstrap's grid system and responsive utilities for consistent layout across devices.

5. **Accessibility**: Maintain proper contrast ratios and semantic HTML structure for accessibility.
