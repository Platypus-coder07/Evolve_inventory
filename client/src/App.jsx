import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import LabOverview from "./pages/LabOverview";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout"; // Import your Layout

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/" element={<LabOverview />} />
              {/* <Route path="/borrow" element={<BorrowComponent />} /> */}
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
