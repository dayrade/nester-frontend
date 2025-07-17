import { render } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('should render with default classes', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted')
  })

  it('should merge custom className with default classes', () => {
    const { container } = render(<Skeleton className="custom-class h-4 w-full" />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'custom-class', 'h-4', 'w-full')
  })

  it('should pass through other props', () => {
    const { container } = render(<Skeleton data-testid="skeleton" aria-label="Loading..." />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton).toHaveAttribute('data-testid', 'skeleton')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading...')
  })

  it('should render as a div element', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    
    expect(skeleton.tagName).toBe('DIV')
  })
})