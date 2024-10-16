// App.js
import { Network, TatumSDK, Ethereum } from "@tatumio/tatum";
import React, { useState } from "react";

function Form() {
  const [inputValue, setInputValue] = useState(""); // State to hold the input value
  const [labelText, setLabelText] = useState(""); // State to hold the label text

  const handleButtonClick = async () => {
    const tatum = await TatumSDK.init<Ethereum>({
      network: Network.ETHEREUM,
      apiKey: { v4: "t-65ddbb2bb792d6001be685d9-442dd087e58442acac87f5f9" },
      verbose: true,
    });
    const balance = await tatum.address.getBalance({
      addresses: [inputValue],
    });
    const balanceData = balance.data.filter(
      (asset) => asset.asset === "ETH"
    )[0];

    setLabelText(`Balance: ${balanceData.balance}`);
  };

  return (
    <div>
      <p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter ETH wallet address to get balance"
          style={{ padding: "5px", width: "320px" }}
        />
      </p>
      <button onClick={handleButtonClick} style={{ padding: "5px" }}>
        Click Me
      </button>
      <p style={{ padding: "5px", fontSize: "16px", fontWeight: "bold" }}>
        {labelText}
      </p>
    </div>
  );
}

export default Form;
