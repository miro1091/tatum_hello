import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import '@testing-library/jest-dom'
import Form from './Form'
import FormUtils from './FormUtils'

// Mock the isValidAddress utility function
jest.mock('./FormUtils', () => ({
  isValidAddress: jest.fn()
}))

describe('Form Component', () => {
  beforeEach(() => {
    FormUtils.isValidAddress.mockReset()
  })

  it('renders input and button elements', () => {
    render(<Form />)

    expect(screen.getByPlaceholderText('Enter ETH wallet address to get balance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument()
  })

  it('shows validation message for invalid Ethereum address', () => {
    FormUtils.isValidAddress.mockReturnValue(false)

    render(<Form />)
    const input = screen.getByPlaceholderText('Enter ETH wallet address to get balance')
    const button = screen.getByRole('button', { name: /Click Me/i })

    fireEvent.change(input, { target: { value: 'invalid address' } })
    fireEvent.click(button)

    expect(screen.getByText('Invalid Ethereum address. Please enter a valid one.')).toBeInTheDocument()
  })

  it('displays loading state when fetching balance', async () => {
    FormUtils.isValidAddress.mockReturnValue(true)

    render(<Form />)
    const input = screen.getByPlaceholderText('Enter ETH wallet address to get balance')
    const button = screen.getByRole('button', { name: /Click Me/i })

    fireEvent.change(input, { target: { value: '0x123' } })
    fireEvent.click(button)

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
  })

  it('shows balance after successful API call', async () => {
    FormUtils.isValidAddress.mockReturnValue(true)
    const mockTatumSDK = {
      address: {
        getBalance: jest.fn().mockResolvedValue({
          data: [{ asset: 'ETH', balance: '1.234' }]
        })
      }
    }

    jest.mock('@tatumio/tatum', () => ({
      TatumSDK: {
        init: jest.fn().mockResolvedValue(mockTatumSDK)
      }
    }))

    render(<Form />)
    const input = screen.getByPlaceholderText('Enter ETH wallet address to get balance')
    const button = screen.getByRole('button', { name: /Click Me/i })

    fireEvent.change(input, { target: { value: '0x123' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Balance: 1.234')).toBeInTheDocument()
    })
  })

  it('shows error message if API call fails', async () => {
    FormUtils.isValidAddress.mockReturnValue(true)
    const mockTatumSDK = {
      address: {
        getBalance: jest.fn().mockRejectedValue(new Error('API error'))
      }
    }

    jest.mock('@tatumio/tatum', () => ({
      TatumSDK: {
        init: jest.fn().mockResolvedValue(mockTatumSDK)
      }
    }))

    render(<Form />)
    const input = screen.getByPlaceholderText('Enter ETH wallet address to get balance')
    const button = screen.getByRole('button', { name: /Click Me/i })

    fireEvent.change(input, { target: { value: '0x123' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch balance. Please try again.')).toBeInTheDocument()
    })
  })
})
