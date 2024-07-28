import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Colors } from 'chart.js';
import axios from 'axios';

// Register components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Chart = ({ selectedMonth }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:3000/api/transactions/barchart', {
                    params: { month: selectedMonth },
                });
                if (response.data) {
                    console.log(response.data);
                    setChartData(response.data);
                } else {
                    setError('Invalid data format received.');
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
                setError('Failed to fetch chart data.');
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, [selectedMonth]);
    
    const processChartData = (chartData) => {
        const boundaries = ['0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901-above'];
        const dataValues = new Array(boundaries.length).fill(0);

        chartData.forEach(item => {
            const boundary = boundaries.find((b) => {
                if (b === '901-above' && item._id >= 901) {
                    return true;
                }
                const [min, max] = b.split('-').map(Number);
                return item._id >= min && item._id <= max;
            });

            const boundaryIndex = boundaries.indexOf(boundary);
            if (boundaryIndex !== -1) {
                dataValues[boundaryIndex] = item.count;
            }
        });

        return dataValues;
    };

    const dataValues = processChartData(chartData);

    const data = {
        labels: ['0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901-above'],
        datasets: [
            {
                label: 'Sales Count',
                data: dataValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                ticks: {
                    beginAtZero: true,
                    precision: 0, 
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: `Bar Chart Stats - ${selectedMonth}`,
                font: {
                    size: 24
                },
                color: 'black'
            },
        },
    };

    return (
        <div className="p-4">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div>Loading...</div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-500">{error}</div>
                </div>
            ) : (
                <Bar data={data} options={options} />
            )}
        </div>
    );
};

export default Chart;