import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Home from "./home";
import Login from "./login";
import Registration from "./register";
import "./App.css";
import { useState } from "react";
import EnrollmentForm from "./enroll";
import EnterAttendance from "./enterAttendance";
import ViewAttendance from "./viewAttendance";
import EditCourse from "./editCourse";
import StudentDashboard from "./student";
import FeesModule from "./fees";
import AdminDashboard from "./admin";
import StaffDashboard from "./staff";
import AdminQueryModule from "./adminQuery";
import QueryModule from "./studentQuery";
import StudentProfile from "./studentProfile";
import StudentFees from "./studFees";
import StaffTaskComponent from "./staffTask";
import StudentTaskComponent from "./studentTask";
import StaffReviewComponent from "./staffReview";
import StudentAttendance from "./studentAttendance";
import ManageAttendance from "./manageAttendance";
import ChatForum from "./studentChat";
import ChatStaff from "./staffChat";
import StudentEdit from "./studentEdit";
import AlumniList from "./alumni";
import ManageStaffAttendance from "./manageStaffAttendance";
import EnterStaffAttendance from "./enterStaffAttendance";
import ConnectionList from "./connectionList";
import MCQuestions from "./mcquestions";
import TestComponent from "./testComponent";
import AssignMCQTest from "./questionManager";
import UpdateStaffProgress from "./staffProgress";
import StaffProgress from "./progressView";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* <Route
            path="/login"
            element={
              <Login
                email={email}
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
              />
            }
          /> */}
          <Route
            path="/"
            element={<Login setLoggedIn={setLoggedIn} setEmail={setEmail} />}
          />

          <Route path="/admin/register" element={<Registration />} />
          <Route path="/admin/enroll" element={<EnrollmentForm />} />
          <Route path="/admin/attendance" element={<EnterStaffAttendance />} />
          <Route
            path="/admin/manageattendance"
            element={<ManageStaffAttendance />}
          />
          <Route path="/admin/leads" element={<ConnectionList />} />
          <Route path="/admin/viewattendance" element={<ViewAttendance />} />
          <Route path="/admin/alumni" element={<AlumniList />} />
          <Route path="/admin/editcourse" element={<EditCourse />} />
          <Route path="/admin/fees" element={<FeesModule />} />
          <Route path="/admin/query" element={<AdminQueryModule />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/viewprogress" element={<StaffProgress />} />
          <Route path="/staff/discuss/:staffId" element={<ChatStaff />} />
          <Route
            path="/staff/attendance/:staffId"
            element={<EnterAttendance />}
          />
          <Route path="staff/mcquestions/:staffId" element={<MCQuestions />} />
          <Route path="/staff/:staffId" element={<StaffDashboard />} />
          <Route path="/staff/task/:staffId" element={<StaffTaskComponent />} />
          <Route
            path="/staff/manageattendance/:staffId"
            element={<ManageAttendance />}
          />
          <Route
            path="/staff/taskreview/:staffId"
            element={<StaffReviewComponent />}
          />
          <Route
            path="/student/profile/:studentId"
            element={<StudentProfile />}
          />
          <Route path="/student/:studentId" element={<StudentDashboard />} />
          <Route path="/student/discuss/:studentId" element={<ChatForum />} />
          <Route
            path="/student/tasks/:studentId"
            element={<StudentTaskComponent />}
          />
          <Route path="/student/edit/:studentId" element={<StudentEdit />} />
          <Route path="/student/fees/:studentId" element={<StudentFees />} />
          <Route
            path="/student/attendance/:studentId"
            element={<StudentAttendance />}
          />
          <Route
            path="/staff/progress/:staffId"
            element={<UpdateStaffProgress />}
          />
          <Route path="/staff/assignmcq/:staffId" element={<AssignMCQTest />} />
          <Route path="/students/query" element={<QueryModule />} />
          <Route path="/student/mcq/:studentId" element={<TestComponent />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
