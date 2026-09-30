  import { BrowserRouter, Routes, Route } from "react-router-dom";

  import Login from "./pages/Login";
  import Register from "./pages/Register";
  import Dashboard from "./pages/Dashboard";
  import GroupDetails from "./pages/GroupDetails";
  import JoinGroup from "./pages/JoinGroup";
  import ProtectedRoute from "./components/ProtectedRoute";
  import ForgotPassword from "./pages/ForgotPassword";
  import ResetPassword from "./pages/ResetPassword";
  import PersonalExpenses from "./pages/PersonalExpenses";


  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/personal-expenses"
            element={
              <ProtectedRoute>
                <PersonalExpenses />
              </ProtectedRoute>
            }
          />

          <Route path="/group/:id" element={<GroupDetails />} />
          <Route path="/join/:inviteCode" element={<JoinGroup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
    path="/reset-password/:token"
    element={<ResetPassword />}
  />
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;