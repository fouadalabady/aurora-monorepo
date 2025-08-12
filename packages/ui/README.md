# @workspace/ui

A comprehensive UI component library built with **shadcn/ui**, **Radix UI**, and **Tailwind CSS** for the Aurora project.

## Overview

This package provides a complete set of accessible, customizable UI components following the shadcn/ui design system. All components are built with TypeScript and include comprehensive testing.

## Installation

This package is part of the Aurora monorepo workspace. To use it in your applications:

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build
```

## Usage

### Importing Components

```tsx
import { Button, Card, Input, Alert } from '@workspace/ui'

// Use components in your application
function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Get started with our UI components</CardDescription>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter your name" />
      </CardContent>
      <CardFooter>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  )
}
```

### Available Components

#### Core Components
- **Button** - Interactive button with multiple variants and sizes
- **Input** - Form input with validation support
- **Textarea** - Multi-line text input
- **Label** - Accessible form labels
- **Card** - Container component with header, content, and footer

#### Navigation
- **Navigation Menu** - Accessible navigation with dropdowns
- **Breadcrumb** - Navigation breadcrumbs
- **Pagination** - Page navigation controls
- **Menubar** - Application menu bar

#### Layout
- **Separator** - Visual dividers
- **Aspect Ratio** - Maintain aspect ratios
- **Scroll Area** - Custom scrollable areas
- **Resizable** - Resizable panels
- **Sidebar** - Application sidebar

#### Forms
- **Form** - Form wrapper with validation
- **Checkbox** - Checkbox input
- **Radio Group** - Radio button groups
- **Select** - Dropdown selection
- **Switch** - Toggle switch
- **Slider** - Range slider
- **Calendar** - Date picker calendar
- **Input OTP** - One-time password input

#### Feedback
- **Alert** - Status messages and notifications
- **Toast** - Temporary notifications
- **Progress** - Progress indicators
- **Skeleton** - Loading placeholders
- **Badge** - Status badges

#### Overlays
- **Dialog** - Modal dialogs
- **Sheet** - Side panels
- **Popover** - Floating content
- **Tooltip** - Contextual tooltips
- **Hover Card** - Rich hover content
- **Alert Dialog** - Confirmation dialogs
- **Context Menu** - Right-click menus
- **Dropdown Menu** - Action menus
- **Command** - Command palette
- **Drawer** - Mobile-friendly drawers

#### Data Display
- **Table** - Data tables
- **Avatar** - User avatars
- **Chart** - Data visualization
- **Carousel** - Image/content carousels

#### Utilities
- **Tabs** - Tabbed interfaces
- **Accordion** - Collapsible content
- **Collapsible** - Show/hide content
- **Toggle** - Toggle buttons
- **Toggle Group** - Toggle button groups

### Component Variants

Most components support multiple variants for different use cases:

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Styling and Customization

Components use Tailwind CSS classes and CSS variables for theming. You can customize the appearance by:

1. **CSS Variables** - Modify theme colors in your CSS
2. **Tailwind Classes** - Add custom classes via the `className` prop
3. **Component Variants** - Use built-in variant props

```tsx
// Custom styling
<Button className="bg-gradient-to-r from-blue-500 to-purple-600">
  Gradient Button
</Button>
```

### Accessibility

All components are built with accessibility in mind:

- **ARIA attributes** - Proper labeling and descriptions
- **Keyboard navigation** - Full keyboard support
- **Focus management** - Logical focus flow
- **Screen reader support** - Compatible with assistive technologies

## Development

### Scripts

```bash
# Development
pnpm dev          # Watch mode for development
pnpm build        # Build the package
pnpm lint         # Lint the code
pnpm type-check   # TypeScript type checking

# Testing
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:coverage # Run tests with coverage
```

### Testing

The package includes comprehensive unit tests using:

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **Jest DOM** - Additional DOM matchers

```bash
# Run all tests
pnpm test:run

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test
```

### Adding New Components

To add new shadcn/ui components:

```bash
# Add components using the CLI
pnpm dlx shadcn@latest add [component-name]

# Update exports in src/index.ts
export * from './components/[component-name]'

# Create tests
# Add to src/components/__tests__/[component-name].test.tsx

# Rebuild the package
pnpm build
```

### Project Structure

```
src/
├── components/           # UI components
│   ├── __tests__/       # Component tests
│   ├── button.tsx       # Button component
│   ├── card.tsx         # Card components
│   └── ...              # Other components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── styles/              # Global styles
├── test/                # Test configuration
└── index.ts             # Main exports
```

## TypeScript Support

Full TypeScript support with:

- **Type definitions** - Complete type coverage
- **IntelliSense** - IDE autocompletion
- **Type checking** - Compile-time error detection

```tsx
import type { ButtonProps } from '@workspace/ui'

// Props are fully typed
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />
}
```

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new components
3. Update documentation for new features
4. Ensure all tests pass before submitting

## License

This package is part of the Aurora project and follows the same license terms.