import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GroupDetails from "./pages/GroupDetails";
import JoinGroup from "./pages/JoinGroup";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/group/:id" element={<GroupDetails />} />
        <Route path="/join/:inviteCode" element={<JoinGroup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;