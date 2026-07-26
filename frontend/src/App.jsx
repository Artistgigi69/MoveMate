import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Home from "./Home";
import ProtectedRoute from "./ProtectedRoute";
import Transfers from "./Transfers";
import CreateTransfer from "./CreateTransfer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditTransfer from "./EditTransfer";

function App() {

  return (
    <BrowserRouter>

      {/* ✅ теперь вне Routes */}
      <ToastContainer />

      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        {/* ❗ у тебя был дубликат "/" */}
        <Route path="/home" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/transfers" element={<Transfers />} />

        <Route path="/create" element={<CreateTransfer />} />

<Route 
 path="/edit-transfer/:id" 
 element={<EditTransfer />} 
/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>

      <ToastContainer />

    </BrowserRouter>
  );
}

export default App;