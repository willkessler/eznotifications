import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './MainLayout';
import HomePage from './HomePage';
import About from './About';
import PayBills from './PayBills';
import TransferMoney from './TransferMoney';
import Deposit from './Deposit';
import Statements from './Statements';

const RouterComponent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />} >
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<HomePage />} />
          <Route path="pay" element={<PayBills />} />
          <Route path="transfer" element={<TransferMoney />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="statements" element={<Statements />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default RouterComponent;
