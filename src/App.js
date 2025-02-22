import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function App() {
    const [trendingStocks, setTrendingStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [socialPosts, setSocialPosts] = useState([]);
    const [stockChartData, setStockChartData] = useState([]);

    useEffect(() => {
        fetchTrendingStocks();
    }, []);

    const fetchTrendingStocks = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/api/trending-stocks");
            setTrendingStocks(response.data);
        } catch (error) {
            console.error("Error fetching trending stocks:", error);
        }
    };

    const fetchSocialPosts = async (symbol) => {
        setSelectedStock(symbol);
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/social-posts/${symbol}`);
            setSocialPosts(response.data);
            fetchStockChartData(symbol);
        } catch (error) {
            console.error("Error fetching social posts:", error);
        }
    };

    const fetchStockChartData = async (symbol) => {
        try {
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
            const prices = response.data.chart.result[0].timestamp.map((time, index) => ({
                time: new Date(time * 1000).toLocaleDateString(),
                price: response.data.chart.result[0].indicators.quote[0].close[index]
            }));
            setStockChartData(prices);
        } catch (error) {
            console.error("Error fetching stock chart data:", error);
        }
    };

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>Trending Stocks</h1>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {trendingStocks.map((stock) => (
                    <li
                        key={stock.symbol}
                        style={{ cursor: "pointer", color: "blue", textDecoration: "underline", marginBottom: "5px" }}
                        onClick={() => fetchSocialPosts(stock.symbol)}
                    >
                        {stock.symbol} - {stock.name} (${stock.price})
                    </li>
                ))}
            </ul>

            {selectedStock && (
                <div>
                    <h2>Trending Posts for {selectedStock}</h2>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {socialPosts.map((post, index) => (
                            <li key={index} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "5px" }}>
                                <strong>@{post.user}</strong>: {post.text}
                                <br />
                                <small>{new Date(post.created_at).toLocaleString()}</small>
                            </li>
                        ))}
                    </ul>

                    <h2>{selectedStock} Stock Price Chart</h2>
                    <LineChart width={400} height={250} data={stockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                </div>
            )}
        </div>
    );
}
