import React, { useState, useEffect } from "react";
import './App.css';

const ConverterForm = () => {
    const [amount, setAmount] = useState(100);
    const [fromCurrency, setFromCurrency] = useState("EUR");
    const [toCurrency, setToCurrency] = useState("USD");
    const [result, setResult] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [rates, setRates] = useState({}); 

    // Fetch the list of currencies
    useEffect(() => {
        fetch("https://api.frankfurter.app/currencies")
            .then((res) => res.json())
            .then((data) => setCurrencies(Object.keys(data)));
    }, []);

    // Fetch exchange rates when the currency changes
    useEffect(() => {
        fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}`)
            .then((res) => res.json())
            .then((data) => setRates(data.rates));
    }, [fromCurrency]);

    // Fetch exchange rate for conversion
    const getExchangeRate = () => {
        if (fromCurrency === toCurrency) {
            setResult(`${amount} ${fromCurrency} = ${amount} ${toCurrency}`);
            return;
        }

        fetch(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
        )
            .then((res) => res.json())
            .then((data) =>
                setResult(
                    `${amount} ${fromCurrency} = ${data.rates[toCurrency]} ${toCurrency}`
                )
            );
    };

    // Swap function
    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="converter-container">
            <h1>Currency Converter</h1>
            <label>Enter Amount:</label>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <div className="currency-selection">
                <label>From:</label>
                <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                >
                    {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                            {currency}
                        </option>
                    ))}
                </select>

                <button className="swap-button" onClick={handleSwapCurrencies}>⇄</button>


                <label>To:</label>
                <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                >
                    {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                            {currency}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={getExchangeRate}>Get Exchange Rate</button>
            <h2>{result}</h2>

            <h3>Exchange Rates for {fromCurrency}</h3>
            <table className="currency-table">
                <thead>
                    <tr>
                        <th>Currency</th>
                        <th>Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(rates).map(([currency, rate]) => (
                        <tr key={currency}>
                            <td>{currency}</td>
                            <td>{rate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ConverterForm;
