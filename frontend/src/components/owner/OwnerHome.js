import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { resetState } from '../redux/slices/ownerSlice';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const OwnerHome = () => {
  const data={
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam"],
    "Bihar": ["Araria", "Aurangabad", "Begusarai", "Bhagalpur", "Bhojpur", "Darbhanga", "Gaya", "Muzaffarpur", "Patna", "Purnia"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Dahod", "Gandhinagar", "Jamnagar", "Junagadh"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Dakshina Kannada"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Chandrapur", "Dhule", "Gadchiroli", "Gondia"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich"]
  }
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOwner, loginOwnerStatus } = useSelector((state) => state.ownerLoginReducer);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('activeTab') || 'dashboard'
  );
  const [empList, setEmpList] = useState(
    JSON.parse(localStorage.getItem('empList')) || []
  );

  const registrationForm = useForm();
  const detailsForm = useForm();


  const { register, handleSubmit, formState: { errors }, reset , watch } = useForm();
  const [serviceCenters, setServiceCenters] = useState([]);
  const [selectedCluster,setCluster]=useState('')
  const clusterData = Object.keys(data)
  useEffect(() => {
    if (selectedCluster) {
       setServiceCenters(data[selectedCluster])
    }
  }, [selectedCluster]);
  

  useEffect(() => {
    if (!loginOwnerStatus) {
      navigate('/'); // Redirect to login if user is not authenticated
    }
  }, [loginOwnerStatus, navigate]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('empList', JSON.stringify(empList));
  }, [empList]);

  const fetchEmployees = async (data) => {
    try {
      const res = await axios.post('http://localhost:4000/owner-api/employeedetails/',data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Pass token for authentication
        },
      });
      setEmpList(res.data.payload);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('empList');
    localStorage.removeItem('selectedEmployee')
    dispatch(resetState());
    navigate('/ownerLogin');
  };

  const onRegistration = async (empObj) => {
    try {
      const res = await axios.post('http://localhost:4000/owner-api/addemployee', empObj, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.message === 'Employee registration success') {
        fetchEmployees(); // Refresh the employee list
        reset(); // Reset form fields
      }
      alert(res.data.message)
    } catch (error) {
      alert('Error registering employee:', error);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(dataBlob, "employees.xlsx");
  };

  // Function to Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Employee Details", 20, 10);

    const tableColumn = ["id", "name", "Age", "Department"];
    const tableRows = data.map(item => [item.id, item.name, item.age, item.department]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("employees.pdf");
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div>
          <h2>Welcome, {currentOwner.name}!</h2>
          <p className="text-muted">Here is your dashboard overview.</p>
        </div>
      );
    }

    if (activeTab === 'registration') {
      return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <form onSubmit={registrationForm.handleSubmit(onRegistration)} className="bg-blue p-4 rounded shadow-lg w-100">
        <h2 className="text-center mb-4">Register a New Employee</h2>
        
        {/* Employee Details */}
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Employee ID</label>
            <input type="text" className="form-control" placeholder="Enter Employee ID" {...registrationForm.register("id", { required: "Employee ID is required" })} />
            {errors.id && <div className="text-danger">{errors.id.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" placeholder="Enter Employee Name" {...registrationForm.register("name", { required: "Employee name is required" })} />
            {errors.name && <div className="text-danger">{errors.name.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter Email" {...registrationForm.register("email", { required: "Email is required" })} />
            {errors.email && <div className="text-danger">{errors.email.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Date of Joining</label>
            <input type="date" className="form-control" {...registrationForm.register("dateOfJoining", { required: "Date of joining is required" })} />
            {errors.dateOfJoining && <div className="text-danger">{errors.dateOfJoining.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Aadhar Number</label>
            <input type="number" className="form-control" placeholder="Enter Aadhar Number" maxLength={12}  {...registrationForm.register("aadhar", { required: "Aadhar number is required" ,pattern: {
                value: /^[0-9]{12}$/,
                 message: "Aadhar number must be exactly 12 digits"
              }
              })} />
            {errors.aadhar && <div className="text-danger">{errors.aadhar.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">PAN Number</label>
            <input type="text" className="form-control" placeholder="Enter PAN Number" {...registrationForm.register("pan", { required: "PAN number is required" })} />
            {errors.pan && <div className="text-danger">{errors.pan.message}</div>}
          </div>
        </div>
        
        {/* Account Details */}
        <fieldset className="border p-3 mt-4 rounded">
          <legend className="w-auto px-2">Account Details</legend>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Account Number</label>
              <input type="text" className="form-control" placeholder="Enter Account Number" {...registrationForm.register("accountNumber", { required: "Account number is required" })} />
              {errors.accountNumber && <div className="text-danger">{errors.accountNumber.message}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Bank Name</label>
              <input type="text" className="form-control" placeholder="Enter Bank Name" {...registrationForm.register("bankName", { required: "Bank name is required" })} />
              {errors.bankName && <div className="text-danger">{errors.bankName.message}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">IFSC Code</label>
              <input type="text" className="form-control" placeholder="Enter IFSC Code" {...registrationForm.register("ifsc", { required: "IFSC code is required" })} />
              {errors.ifsc && <div className="text-danger">{errors.ifsc.message}</div>}
            </div>
          </div>
        </fieldset>
        
        {/* Dropdowns */}
        <div className="row g-3 mt-3">

          <div className="col-md-6">
          <label className="form-label">Select Cluster:</label>
                <select className="form-select" {...registrationForm.register("cluster")} onChange={(e) => setCluster(e.target.value)} required
                > 
                  <option value="" selected disabled>-- Select a Cluster --</option>
                  {clusterData.map((clusterName, index) => {
                    return (
                      <option key={index} value={clusterName}>
                        {clusterName}
                      </option>
                    );
                  })}
                </select>
          </div>

          <div className="col-md-6">
          <label className="form-label">Select Service Center:</label>
                <select className="form-select" {...registrationForm.register("serviceCenter")} required disabled={!serviceCenters.length}>
                  <option value="" selected disabled>-- Select a Service Center --</option>
                  {serviceCenters.map((serviceCenter, index) => (
                    <option key={index} value={serviceCenter}>
                      {serviceCenter}
                    </option>
                  ))}
                </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Type</label>
            <select className="form-select" {...registrationForm.register("type", { required: "Type is required" })}>
              <option value="" disabled selected>Select Type</option>
              <option value="hk">HK</option>
              <option value="dlv">DLV</option>
              <option value="deo">DEO</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Daily wage</label>
            <input type="number" className="form-control" placeholder="Enter Daily wage" {...registrationForm.register("dailyWage", { required: "Daily wage is required" })} />
            {errors.dailyWage && <div className="text-danger">{errors.dailyWage.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Basic Salary</label>
            <input type="number" className="form-control" placeholder="Enter Basic" {...registrationForm.register("basic", { required: "Basic Salary is required" })} />
            {errors.basic && <div className="text-danger">{errors.basic.message}</div>}
          </div>
        </div>
        
        {/* Submit Button */}
        <button type="submit" className="btn btn-primary w-100  m-auto mt-4 ">Register</button>
      </form>
    </div>
        
      );
    }

    if (activeTab === 'details') {
      return (
        <div>
          <form onSubmit={detailsForm.handleSubmit(fetchEmployees)} className="container p-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-3">
                <label className="form-label">Select Cluster:</label>
                <select className="form-select" {...detailsForm.register("cluster")} onChange={(e) => setCluster(e.target.value)}
                > 
                  <option value="" selected disabled>-- Select a Cluster --</option>
                  {clusterData.map((clusterName, index) => {
                    return (
                      <option key={index} value={clusterName}>
                        {clusterName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Select Service Center:</label>
                <select className="form-select" {...detailsForm.register("serviceCenter")} disabled={!serviceCenters.length}>
                  <option value="" selected disabled>-- Select a Service Center --</option>
                  {serviceCenters.map((serviceCenter, index) => (
                    <option key={index} value={serviceCenter}>
                      {serviceCenter}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Select Type:</label>
                <select className="form-select" {...detailsForm.register("type")}>
                  <option value="" selected disabled>-- Select a Type --</option>
                  <option value="dlv">DLV</option>
                  <option value="deo">DEO</option>
                  <option value="hk">HK</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Enter Year:</label>
                <input 
                  type="number" 
                  className="form-control" 
                  {...detailsForm.register("year")} 
                  placeholder="Enter Year"
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Select Month:</label>
                <select className="form-select" {...detailsForm.register("month")} required>
                  <option value="" selected disabled>-- Select a Month --</option>
                  {Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" })).map((month, index) => (
                    <option key={index} value={index+1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Box for Year */}
              
            </div>

            <div className="text-center mt-3">
              <button type="submit" className="btn btn-primary">Fetch Details</button>
            </div>
         </form>
        {empList.length>0 && (<div className="table-responsive">
          <h4 className="mb-3">Employee Details</h4>
              <div className="" style={{ maxHeight: '500px', overflowX: 'auto' }}>
                <table className="table table-responsive table-striped table-hover table-light border-dark text-center">
                  {/* Sticky Table Header */}
                  <thead className="table-primary" style={{ position: 'sticky', top: 0 ,zIndex: 2 }}>
                    <tr>
                      <th>Name</th>
                      <th>ID</th>
                      <th>Cluster</th>
                      <th>Service Center</th>
                      <th>Daily Wage</th>
                      <th>No of Days Present</th>
                      <th>Total Wages</th>
                      <th>Basic</th>
                      <th>Others</th>
                      <th>Gross Wages</th>
                      <th>PF</th>
                      <th>ESIC</th>
                      <th>Net Wages</th>
                      <th>PF Emper</th>
                      <th>ESIC Emp</th>
                      <th>Total Cost</th>
                      <th>Service Charge</th>
                      <th>Total Charges</th>
                      <th className="sticky-col" style={{ position: 'sticky', right: 0}}>Profile</th> {/* Sticky last column */}
                    </tr>
                  </thead>

                  {/* Scrollable Table Body */}
                  <tbody >
                    {empList.map((emp) => {
                      // Declare variables
                      const total_wages = Math.round(emp.dailyWage * emp.daysPresent);
                      const basic = Math.round((emp.basic / 30) * emp.daysPresent);
                      const others = Math.round(total_wages - basic);
                      const pf = Math.round((basic * 12) / 100);
                      const esic = Math.round((total_wages * 0.75) / 100);
                      const net_wages = Math.round(total_wages - pf - esic);
                      const pf_emper = Math.round((basic * 13) / 100);
                      const esic_emp = Math.round((total_wages * 3.25) / 100);
                      const total_cost = Math.round(total_wages + pf_emper + esic_emp);
                      const service_charge = Math.round((total_cost * 6) / 100);
                      const total_charges = Math.round(total_cost + service_charge);

                      return (
                        <tr key={emp.id} >
                          <td>{emp.name}</td>
                          <td>{emp.id}</td>
                          <td>{emp.cluster}</td>
                          <td>{emp.serviceCenter}</td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={emp.dailyWage} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={emp.daysPresent} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={total_wages} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={basic} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={others} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={total_wages} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={pf} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={esic} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={net_wages} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={pf_emper} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={esic_emp} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={total_cost} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={service_charge} readOnly /></td>
                          <td><input type="number" className='form-control' style={{ width: '150px' }} value={total_charges} readOnly /></td>

                          {/* Sticky Last Column (Profile Button) */}
                          <td className="sticky-col" style={{ position: 'sticky', right: 0}}>
                            <button
                              className="btn btn-primary"
                              onClick={() => navigate(`/employee/${emp.id}`, { state: emp })}
                              style={{ cursor: 'pointer' }}
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
                  <button onClick={exportToExcel} style={{ margin: "10px", padding: "10px", cursor: "pointer" }}>
                    Download Excel
                  </button>
                  <button onClick={exportToPDF} style={{ margin: "10px", padding: "10px", cursor: "pointer" }}>
                    Download PDF
                  </button>
        </div>)}
        </div>
      );
    }
  };

  return (
    <div className="p-5 pt-1 bg-secondary bg-opacity-25">
      <nav className="navbar navbar-expand-lg navbar-light m-0">
        <div className="container-fluid text-dark">
          <a className="navbar-brand" href="#!">Owner Panel</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeTab === 'registration' ? 'active' : ''}`}
                  onClick={() => setActiveTab('registration')}
                >
                  Employee Registration
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Employee Details
                </button>
              </li>
            </ul>
            <ul className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#!"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1rNuFRQJ0m9EkNrwaJtyxCSEfY7Rz35rC_g&s"
                  alt=""
                  width="40px"
                  className="m-0"
                />
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item" to="">Change Password</Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="btn btn-danger m-2" onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </ul>
          </div>
        </div>
      </nav>

      <div className="dynamic-content m-0 rounded-0">{renderContent()}</div>
    </div>
  );
};

export default OwnerHome;
