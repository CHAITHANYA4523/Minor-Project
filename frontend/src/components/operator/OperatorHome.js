import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { resetState } from '../redux/slices/operatorSlice';


const OperatorHome = () => {

  const { currentOperator, loginOperatorStatus } = useSelector((state) => state.operatorLoginReducer);
  
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [empList, setEmpList] = useState(
    JSON.parse(localStorage.getItem('empList')) || []
  );

  const [attendance, setAttendance] = useState({});
  const [AttendanceSummary,setAttendanceSummary]=useState({})
  const [selectedEmployee, setSelectedEmployee] = useState(
    JSON.parse(localStorage.getItem('selectedEmployee')) || null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to fetch attendance
 
  useEffect(() => {
      if (!loginOperatorStatus) {
        navigate('/'); // Redirect to login if user is not authenticated
      }
    }, [loginOperatorStatus, navigate]);
  

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    if (activeTab === 'attendance' && empList.length === 0) {
      fetchEmployees();
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('empList', JSON.stringify(empList));
  }, [empList]);

  useEffect(() => {
    localStorage.setItem('selectedEmployee', JSON.stringify(selectedEmployee));
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/operator-api/employeedetails/${currentOperator.serviceCenter
      }`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Pass token for authentication
        },
      });
      setEmpList(res.data.payload);
    } catch (error) {
      console.error("Error fetching employee data", error);
    }
  };

  const handleAttendanceChange = (id, value) => {
    // If checkbox is checked, status is "present", otherwise "absent"
    setAttendance({ ...attendance, [id]:value});
  };

  const submitAttendance = () => {
    const attendanceData = Object.keys(attendance).map((id) => ({
      id: id,
      month:parseInt(month, 10),
      year:parseInt(year, 10),
      noOfPresentDays: attendance[id],
    }));
    axios.post('http://localhost:4000/operator-api/employeeAttendance', attendanceData).then((res) => {
      alert(res.data.message);
      window.location.reload();
     });

    console.log(attendanceData)
  };

  // const fetchAttendance = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError("");

  //     const token = localStorage.getItem("token"); // Authentication token
  //     const res = await axios.post(
  //       "http://localhost:4000/operator-api/fetchattendance",
  //       {
  //         year,
  //         month,
  //         empList, // Employee list to identify corresponding employees
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // Add token in headers
  //         },
  //       }
  //     );

  //     setAttendanceSummary(res.data); // Update state with attendance data
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Failed to fetch attendance");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleLogout = () => {
       
    localStorage.removeItem('token');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('empList');
    localStorage.removeItem('selectedEmployee') // Clear data on logout
    dispatch(resetState());
    navigate('/operatorLogin');
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <h2>Welcome {currentOperator.name}</h2>;
    }
    // if(activeTab==='AttendanceSummary'){
    //   return (
    //     <div>
    //   <h3>Attendance</h3>
    //   <div className="d-flex align-items-center mb-3">
    //     <label htmlFor="year" className="me-2">
    //       Select Year:
    //     </label>
    //     <input
    //       type="number"
    //       id="year"
    //       value={year}
    //       onChange={(e) => setYear(e.target.value)}
    //       className="form-control me-3"
    //       style={{ width: "120px" }}
    //     />
    //     <label htmlFor="month" className="me-2">
    //       Select Month:
    //     </label>
    //     <select
    //       id="month"
    //       value={month}
    //       onChange={(e) => setMonth(e.target.value)}
    //       className="form-select"
    //       style={{ width: "150px" }}
    //     >
    //       {[...Array(12)].map((_, index) => (
    //         <option key={index + 1} value={index + 1}>
    //           {new Date(0, index).toLocaleString("default", { month: "long" })}
    //         </option>
    //       ))}
    //     </select>
    //     <button onClick={fetchAttendance} className="btn btn-primary ms-3">
    //       Fetch Attendance
    //     </button>
    //   </div>

    //   {isLoading && <p>Loading...</p>}
    //   {error && <p className="text-danger">{error}</p>}

    //   {!isLoading && AttendanceSummary.length > 0 && (
    //     <div className="table-responsive">
    //       <table className="table table-striped table-hover">
    //         <thead className="table-primary">
    //           <tr>
    //             <th>Employee ID</th>
    //             <th>Date</th>
    //             <th>Status</th>
    //           </tr>
    //         </thead>
    //         {AttendanceSummary.map((recordArray, index) => (
    //             <tbody key={index}>
    //               {recordArray.map((record, idx) => (
    //                 <tr key={idx}>
    //                   <td>{record.id}</td>
    //                   <td>{record.date}</td>
    //                   <td>{record.status}</td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           ))}

    //       </table>
    //     </div>
    //   )}

    //   {!isLoading  && AttendanceSummary.length === 0 && (
    //     <p>No attendance data found for the selected month and year.</p>
    //   )}
    // </div>
      
    //   )
    // }

    if (activeTab === 'attendance') {
      return (
        <div className="container mt-4">
      <h2>Employee Attendance</h2>
      
      <div className="d-flex align-items-center mb-3">
        <label className="me-2">Select Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="form-control me-3"
          style={{ width: "120px" }}
        />

        <label className="me-2">Select Month:</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="form-select"
          style={{ width: "150px" }}
        >
          {[...Array(12)].map((_, index) => (
            <option key={index + 1} value={index + 1}>
              {new Date(0, index).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

        <div className='table-responsive-sm'>
          <table className='table table-stripped table-hover table-light text-center'>
            <thead>
              <tr className='table-primary'>
                <th>Name</th>
                <th>Id</th>
                <th>Attendance</th>
                <th></th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {empList.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.id}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control m-auto"
                      min="0"
                      value={attendance[emp.id] || ""}
                      onChange={(e) => handleAttendanceChange(emp.id, e.target.value)}
                      placeholder="Enter attendance"
                      style={{ width: "200px" }}
                    />
                  </td>
                  <td>
                    <button
                      className='btn btn-primary'
                      onClick={() => setSelectedEmployee(emp)}
                      style={{ cursor: 'pointer' }}
                    >
                      profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={submitAttendance} className="btn btn-primary m-auto">
            Submit Attendance
          </button>
          

          {selectedEmployee && (
            <div className='card mt-4'>
              <div className='card-header bg-primary text-white'>Employee Details</div>
              <div className='card-body'>
                <p><strong>Name:</strong> {selectedEmployee.name}</p>
                <p><strong>Id:</strong> {selectedEmployee.id}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Cluster:</strong> {selectedEmployee.cluster}</p>
                <p><strong>Service Center:</strong> {selectedEmployee.serviceCenter}</p>
                <p><strong>Type:</strong> {selectedEmployee.type}</p>
              </div>
              <div className='card-footer'>
                <button className='btn btn-secondary' onClick={() => setSelectedEmployee(null)}>Close</button>
              </div>
            </div>
          )}
        </div>
        </div>
      );
    }
  };

  return (
    <div className="container ">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid text-dark">
          <a className="navbar-brand" href="#">Operator Panel</a>
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
                  className={`nav-link btn ${activeTab === 'attendance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('attendance')}
                >
                  Employee Attendance
                </button>
              </li>
              {/* <li className="nav-item">
                <button
                  className={`nav-link btn ${activeTab === 'AttendanceSummary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('AttendanceSummary')}
                >
                  Employee Attendance
                </button>
              </li> */}
            </ul>

            <ul className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1rNuFRQJ0m9EkNrwaJtyxCSEfY7Rz35rC_g&s"
                  alt=""
                  width='40px'
                  className='m-0'
                />
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li>
                  <Link className="dropdown-item">Change password</Link>
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

      {/* Dynamic Content Rendering */}
      <div className="dynamic-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default OperatorHome;
