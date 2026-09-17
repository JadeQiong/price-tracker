import { useEffect, useState } from "react";
import type { PriceRecord } from "./types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA_URL = "/price-tracker/data/price_history.json";

function App() {
  const [history, setHistory] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartData = history.map((record) => ({
    date: new Date(record.timestamp).toLocaleDateString(),
    price: record.price,
  }));

  useEffect(() => {
    async function loadPriceHistory() {
      try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
          throw new Error(
            `Failed to load price history: ${response.status}`
          );
        }

        const data: PriceRecord[] = await response.json();

        setHistory(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load price history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPriceHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (history.length === 0) {
    return <div>No price history available.</div>;
  }

  const latest = history[history.length - 1];

  return (
    <main>
      <h1>Costco Price Tracker</h1>

      <h2>Callaway Edge 10-Piece Golf Club Set</h2>

      <div>
        <p>Current Price</p>
        <strong>${latest.price.toFixed(2)}</strong>
      </div>

      <p>
        Last checked:{" "}
        {new Date(latest.timestamp).toLocaleString()}
      </p>

      <h2>Price History</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Price</th>
          </tr>
        </thead>

        <tbody>
          {[...history].reverse().map((record) => (
            <tr key={record.timestamp}>
              <td>
                {new Date(record.timestamp).toLocaleString()}
              </td>
              <td>${record.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Price History</h2>

<div style={{ width: "100%", height: 350 }}>
  <ResponsiveContainer>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="date" />

      <YAxis
        domain={["auto", "auto"]}
        tickFormatter={(value) => `$${value}`}
      />

      <Tooltip
        formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
      />

      <Line
        type="monotone"
        dataKey="price"
        strokeWidth={2}
        dot
      />
    </LineChart>
  </ResponsiveContainer>
</div>

    </main>
  );
}

export default App;