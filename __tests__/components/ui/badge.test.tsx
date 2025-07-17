import { render } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('should render with default variant', () => {
    const { getByText } = render(<Badge>Default Badge</Badge>)
    const badge = getByText('Default Badge')
    
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold')
  })

  it('should render with secondary variant', () => {
    const { getByText } = render(<Badge variant="secondary">Secondary Badge</Badge>)
    const badge = getByText('Secondary Badge')
    
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground')
  })

  it('should render with destructive variant', () => {
    const { getByText } = render(<Badge variant="destructive">Destructive Badge</Badge>)
    const badge = getByText('Destructive Badge')
    
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('should render with outline variant', () => {
    const { getByText } = render(<Badge variant="outline">Outline Badge</Badge>)
    const badge = getByText('Outline Badge')
    
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-foreground')
  })

  it('should merge custom className with variant classes', () => {
    const { getByText } = render(
      <Badge variant="secondary" className="custom-class">
        Custom Badge
      </Badge>
    )
    const badge = getByText('Custom Badge')
    
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground', 'custom-class')
  })

  it('should pass through other props', () => {
    const { getByText } = render(
      <Badge data-testid="test-badge" aria-label="Test badge">
        Test Badge
      </Badge>
    )
    const badge = getByText('Test Badge')
    
    expect(badge).toHaveAttribute('data-testid', 'test-badge')
    expect(badge).toHaveAttribute('aria-label', 'Test badge')
  })

  it('should render as a div element by default', () => {
    const { getByText } = render(<Badge>Badge</Badge>)
    const badge = getByText('Badge')
    
    expect(badge.tagName).toBe('DIV')
  })

  it('should render children correctly', () => {
    const { getByText } = render(
      <Badge>
        <span>Icon</span>
        Badge Text
      </Badge>
    )
    
    expect(getByText('Icon')).toBeInTheDocument()
    expect(getByText('Badge Text')).toBeInTheDocument()
  })
})