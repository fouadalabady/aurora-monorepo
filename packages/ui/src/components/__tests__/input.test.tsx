import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  it('handles controlled input', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input value="" onChange={handleChange} placeholder="Controlled" />)
    
    const input = screen.getByPlaceholderText('Controlled')
    await user.type(input, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('applies different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />)
    expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('has correct default styling', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2'
    )
  })

  it('handles focus and blur events', async () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus test" />)
    
    const input = screen.getByPlaceholderText('Focus test')
    
    await user.click(input)
    expect(handleFocus).toHaveBeenCalled()
    
    await user.tab()
    expect(handleBlur).toHaveBeenCalled()
  })

  it('supports required attribute', () => {
    render(<Input required data-testid="input" />)
    expect(screen.getByTestId('input')).toBeRequired()
  })

  it('supports readonly attribute', () => {
    render(<Input readOnly data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('readonly')
  })
})