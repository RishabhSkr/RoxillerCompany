import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from  './components/Home.jsx'
export default function App() {
  return <div>
      <Router>
        <Routes>
          <Route path={'/'} element={<Home />} />
        </Routes>
      </Router>

  </div>
  
}
