// App.js
import { Network, TatumSDK, Ethereum } from '@tatumio/tatum'
import React, { useState } from 'react'

// styles
import './style.css'

// utils
import FormUtils from './FormUtils'

const apiKey = import.meta.env.VITE_TATUM_API_KEY

function Form() {
  const [inputValue, setInputValue] = useState('') // State to hold the input value
  const [labelText, setLabelText] = useState('') // State to hold the label text
  const [loading, setLoading] = useState(false)

  const handleButtonClick = async () => {
    if (!FormUtils.isValidAddress(inputValue)) {
      setLabelText('Invalid Ethereum address. Please enter a valid one.')
      return
    }

    setLoading(true)
    setLabelText('')

    try {
      const tatum = await TatumSDK.init<Ethereum>({
        network: Network.ETHEREUM,
        apiKey: { v4: apiKey },
        verbose: true
      })

      const balance = await tatum.address.getBalance({
        addresses: [inputValue]
      })

      const balanceData = balance.data.filter(asset => asset.asset === 'ETH')[0]

      if (balanceData) {
        setLabelText(`Balance: ${balanceData.balance}`)
      } else {
        setLabelText('No ETH balance found.')
      }
    } catch (err) {
      setLabelText('Failed to fetch balance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter ETH wallet address to get balance"
          className="input"
        />
      </p>
      <button onClick={handleButtonClick} className="button">
        {loading ? 'Loading...' : 'Click Me'}
      </button>
      <div className="container-label">
        <p className="label">{labelText}</p>
      </div>
    </div>
  )
}

export default Form
