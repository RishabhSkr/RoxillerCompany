import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import { Statistics } from './Statistics';
import Chart from './Chart'; // Assuming this is the BarChart component

const months = [
  { name: 'January' },
  { name: 'February' },
  { name: 'March' },
  { name: 'April' },
  { name: 'May' },
  { name: 'June' },
  { name: 'July' },
  { name: 'August' },
  { name: 'September' },
  { name: 'October' },
  { name: 'November' },
  { name: 'December' },
];

export const Home = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(months[2].name);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3000/api/transactions', {
          params: { month: selectedMonth, page: currentPage, search: searchTerm },
        });
        if (response.data) {
          console.log(response.data);
          setTransactions(response.data.products);
          setTotalPages(response.data.totalPages);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [selectedMonth, currentPage, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen w-screen">
      <Header />
      <Filter
        selectedMonth={selectedMonth}
        handleMonthChange={handleMonthChange}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <Table
          transactions={transactions}
          currentPage={currentPage}
          totalPages={totalPages}
          handleNextPage={handleNextPage}
          handlePreviousPage={handlePreviousPage}
        />
      )}
      <Statistics selectedMonth={selectedMonth} />
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto p-4">
        <Chart selectedMonth={selectedMonth} key={selectedMonth} /> {/* Add key to force re-render */}
      </div>
    </div>
  );
};

function Filter({ selectedMonth, handleMonthChange, searchTerm, handleSearchChange }) {
  return (
    <div className="flex flex-col items-center">
      <div className="mt-8 flex flex-col md:flex-row justify-between w-full md:w-3/4 lg:w-1/2 items-center">
        <input
          type="text"
          placeholder="Search Transaction"
          value={searchTerm}
          onChange={handleSearchChange}
          className="p-2.5 text-black bg-[#ffcf87] rounded-full mb-4 md:mb-0"
        />
        <select
          value={selectedMonth}
          className="bg-[#ffb546] text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          onChange={handleMonthChange}
        >
          {months.map((month, index) => (
            <option key={index} value={month.name}>{month.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Table({ transactions, currentPage, totalPages, handleNextPage, handlePreviousPage }) {
  const [expandedDescriptionId, setExpandedDescriptionId] = useState(null);

  const handleToggleDescription = (id) => {
    setExpandedDescriptionId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="mt-8 w-full md:w-3/4 lg:w-1/2 mx-auto p-4">
      <div >
        <table className="w-full sm:w- rounded-3xl bg-[rgb(248,223,140)] text-left text-gray-500 text-sm border-black">
          <thead className="border-b-2 border-black">
            <tr>
              <th scope="col" className="px-6 py-3 border-r-2 border-black">ID</th>
              <th scope="col" className="px-6 py-3 border-r-2 border-black">Title</th>
              <th scope="col" className="px-6 py-3 border-r-2 border-black">Description</th>
              <th scope="col" className="px-6 py-3 border-r-2 border-black">Price</th>
              <th scope="col" className="px-6 py-3 border-r-2 border-black">Category</th>
              <th scope="col" className="px-6 py-3 border-r-2 border-black">Sold</th>
              <th scope="col" className="px-6 py-3">Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b-2 border-black">
                <td className="px-6 py-4 border-r-2 border-black">{transaction.id}</td>
                <td className="px-6 py-4 border-r-2 border-black">{transaction.title}</td>
                <td className="px-6 py-4 border-r-2 border-black">
                  {expandedDescriptionId === transaction.id ? (
                    <div>
                      {transaction.description}
                      <button
                        onClick={() => handleToggleDescription(transaction.id)}
                        className="text-blue-500 underline ml-2"
                      >
                        Show Less
                      </button>
                    </div>
                  ) : (
                    <div>
                      {transaction.description.length > 100
                        ? `${transaction.description.substring(0, 100)}...`
                        : transaction.description}
                      {transaction.description.length > 100 && (
                        <button
                          onClick={() => handleToggleDescription(transaction.id)}
                          className="text-blue-500 underline ml-2"
                        >
                          Show More
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 border-r-2 border-black">{transaction.price}</td>
                <td className="px-6 py-4 border-r-2 border-black">{transaction.category}</td>
                <td className="px-6 py-4 border-r-2 border-black">{transaction.sold ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">
                  <img height="100px" className="product-image" src={transaction.image} alt={transaction.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-transparent text-black"
          >
            Previous
          </button>
          <div className="text-center mt-2">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-transparent text-black"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
