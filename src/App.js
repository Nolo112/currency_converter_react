import React, { useState, useEffect, useRef } from "react";
import './App.css';
import Chart from 'chart.js';

const ConverterForm = () => {
    const [amount, setAmount] = useState(100);
    const [fromCurrency, setFromCurrency] = useState("EUR");
    const [toCurrency, setToCurrency] = useState("USD");
    const [result, setResult] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [rates, setRates] = useState({});
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        fetch("https://api.frankfurter.app/currencies")
            .then((res) => res.json())
            .then((data) => setCurrencies(Object.keys(data)));
    }, []);

    useEffect(() => {
        fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}`)
            .then((res) => res.json())
            .then((data) => setRates(data.rates));

        getHistoricalRates(fromCurrency, toCurrency);
    }, [fromCurrency, toCurrency]);

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

    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    const getHistoricalRates = (base, quote) => {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date((new Date()).getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=${base}&to=${quote}`)
            .then(res => res.json())
            .then(data => {
                const chartLabels = Object.keys(data.rates);
                const chartData = chartLabels.map(date => data.rates[date][quote]);
                buildChart(chartLabels, chartData, `${base}/${quote}`);
            })
            .catch(error => console.error(error));
    };

    const buildChart = (labels, data, label) => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: label,
                        data: data,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
            },
        });
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

            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default ConverterForm;
