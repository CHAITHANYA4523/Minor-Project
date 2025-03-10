
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RootLayout from './components/rootlayout/RootLayout'
import OwnerLogin from './components/owner/OwnerLogin'
import OperatorLogin from './components/operator/OperatorLogin';
import OperatorRegister from './components/operator/OperatorRegister';
import OperatorHome from './components/operator/OperatorHome';
import AdminLogin from './components/admin/Admin'
import AdminHome from './components/admin/AdminHome';
import OwnerHome from './components/owner/OwnerHome'
import EmployeeProfile from './components/user/EmployeeProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootLayout />}>
        <Route path="ownerLogin" element={<OwnerLogin />} />
        <Route path="operatorLogin" element={<OperatorLogin />} />
        <Route path="operatorRegister" element={<OperatorRegister />} />

        <Route path="adminLogin" element={<AdminLogin/>}/>
        </Route>
        <Route path="adminHome" element={<AdminHome/>}/>
        <Route path="ownerHome" element={<OwnerHome/>}/>
        <Route path="operatorHome" element={<OperatorHome/>}/>
        <Route path="employee/:id" element={<EmployeeProfile/>}/>

      </Routes>
    </Router>
  );
}

export default App;
