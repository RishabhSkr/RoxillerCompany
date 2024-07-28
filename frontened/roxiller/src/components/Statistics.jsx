import { useEffect, useState } from 'react';
import axios from 'axios';

export const Statistics = ({ selectedMonth }) => {
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:3000/api/transactions/statistics', {
                    params: { month: selectedMonth },
                });
                if (response.data) {
                    console.log(response.data);
                    setStatistics(response.data);
                } else {
                    setError('Invalid data format received.');
                }
            } catch (err) {
                console.error('Error fetching statistics:', err);
                setError('Failed to fetch statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStatistics();
    }, [selectedMonth]);

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div>Loading...</div>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-500">{error}</div>
                </div>
            ) : (
                <div className="  text-gray-900 text-lg h-auto w-96 p-4 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Statistics - {selectedMonth}</h2>
                    <div className='s bg-[#ffcf87] rounded-2xl p-3 flex flex-col justify-between'>
                        <div className='flex justify-between items-center p-2'><span>Total Sale</span> <span>{statistics.totalSalesAmount}</span></div>
                        <div className='flex justify-between items-center p-2'><span>Total sold item</span> <span>{statistics.totalSoldItems}</span></div>
                        <div className='flex justify-between items-center p-2'><span>Total not sold item</span> <span>{statistics.totalNotSoldItems}</span></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Statistics;
