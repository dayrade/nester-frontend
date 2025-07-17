# Global Loader System

This document explains how to use the global loader system implemented in the Nester application.

## Overview

The global loader system provides a consistent loading experience across all pages in the application. It consists of:

1. **Loader Component** (`components/ui/loader.tsx`) - The animated NESTER text loader
2. **Page Loader Component** (`components/ui/page-loader.tsx`) - Full-screen overlay wrapper
3. **Loading Provider** (`contexts/loading-provider.tsx`) - Context for managing loading state
4. **useLoading Hook** (`hooks/use-loading.ts`) - Easy-to-use hook for components

## Components

### Loader Component

The base loader component with the animated NESTER text effect.

```tsx
import { Loader } from '@/components/ui/loader'

<Loader text="NESTER" className="custom-class" />
```

### Page Loader Component

Full-screen loading overlay that can be shown/hidden.

```tsx
import { PageLoader } from '@/components/ui/page-loader'

<PageLoader isLoading={true} text="Loading..." />
```

## Usage

### Basic Usage

```tsx
import { useLoading } from '@/hooks/use-loading'

function MyComponent() {
  const { showLoader, hideLoader, isLoading } = useLoading()

  const handleAction = async () => {
    showLoader('Processing...')
    try {
      await someAsyncOperation()
    } finally {
      hideLoader()
    }
  }

  return (
    <button onClick={handleAction} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Click me'}
    </button>
  )
}
```

### Using withLoading Wrapper

The `withLoading` function automatically manages the loader for async operations:

```tsx
import { useLoading } from '@/hooks/use-loading'

function MyComponent() {
  const { withLoading } = useLoading()

  const handleAction = async () => {
    await withLoading(
      async () => {
        // Your async operation here
        await fetch('/api/data')
        // Process response
      },
      'Loading data...' // Optional custom text
    )
  }

  return <button onClick={handleAction}>Load Data</button>
}
```

### Form Submissions

Example of using the loader with form submissions:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  try {
    await withLoading(async () => {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Submission failed')
      }
      
      // Handle success
      router.push('/success')
    }, 'Submitting form...')
  } catch (error) {
    // Handle error
    setError(error.message)
  }
}
```

## API Reference

### useLoading Hook

```tsx
const {
  isLoading,     // boolean - current loading state
  showLoader,    // (text?: string) => void - show loader with optional text
  hideLoader,    // () => void - hide loader
  setLoading,    // (loading: boolean) => void - set loading state directly
  withLoading    // <T>(asyncFn: () => Promise<T>, text?: string) => Promise<T>
} = useLoading()
```

### LoadingProvider Props

```tsx
interface LoadingProviderProps {
  children: ReactNode
}
```

### PageLoader Props

```tsx
interface PageLoaderProps {
  isLoading: boolean
  text?: string        // Default: 'NESTER'
  className?: string   // Additional CSS classes
}
```

### Loader Props

```tsx
interface LoaderProps {
  text?: string        // Default: 'NESTER'
  className?: string   // Additional CSS classes
}
```

## Customization

### Changing the Loader Animation

To replace the loader with a different design:

1. Update `components/ui/loader.tsx` with your new component
2. Update `components/ui/loader.css` with your new styles
3. The rest of the system will automatically use your new loader

### Custom Loading Text

You can customize the loading text for different operations:

```tsx
// Different texts for different operations
showLoader('Uploading images...')
showLoader('Processing payment...')
showLoader('Generating content...')
```

### Styling

The loader uses Tailwind CSS classes and can be customized by:

1. Modifying the CSS file: `components/ui/loader.css`
2. Adding custom classes via the `className` prop
3. Updating the default styles in the components

## Best Practices

1. **Always use try/catch** when using `withLoading` to handle errors properly
2. **Provide descriptive loading text** to improve user experience
3. **Don't nest loaders** - the global loader should be used for page-level operations
4. **Keep loading operations short** - for long operations, consider progress indicators
5. **Test loading states** - ensure the loader appears and disappears correctly

## Examples in the Codebase

- **Dashboard Page**: Uses `withLoading` for initial data loading
- **Property Add Page**: Uses `withLoading` for form submissions and URL scraping
- **Authentication**: Can be extended to show loading during login/logout

## Migration Guide

To migrate existing loading states to the global loader:

1. Remove local loading state: `const [loading, setLoading] = useState(false)`
2. Import the hook: `import { useLoading } from '@/hooks/use-loading'`
3. Use the hook: `const { withLoading } = useLoading()`
4. Wrap async operations: `await withLoading(asyncFunction, 'Loading...')`
5. Remove manual `setLoading(true/false)` calls

## Troubleshooting

### Loader not appearing
- Ensure `LoadingProvider` is wrapped around your app in `layout.tsx`
- Check that you're calling `showLoader()` or using `withLoading()`

### Loader not disappearing
- Ensure `hideLoader()` is called in finally blocks
- Use `withLoading()` which automatically handles cleanup

### Multiple loaders
- The global loader is designed to be singular - avoid multiple simultaneous loading states
- Queue operations or use a single loading state for multiple operations