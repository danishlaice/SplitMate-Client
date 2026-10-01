import { Navigate } from "react-router-dom";
import safeStorage from "../utils/storage";

function ProtectedRoute({ children }) {
  const token = safeStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;