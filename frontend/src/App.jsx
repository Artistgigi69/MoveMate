import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider, useTheme } from "./ThemeContext";
import { CurrencyProvider } from "./CurrencyContext";

import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import Settings from "./pages/Settings";

import Transfers from "./Transfers";
import CreateTransfer from "./CreateTransfer";
import EditTransfer from "./EditTransfer";
import UtilityDetail from "./pages/UtilityDetail";
import AddressHistory from "./pages/AddressHistory";
import CardcomCallback from "./pages/CardcomCallback";
import ConfirmMeter from "./pages/ConfirmMeter";
import Checklist from "./pages/Checklist";
import Referrals from "./pages/Referrals";
import Premium from "./pages/Premium";

import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Cards from "./pages/Cards";


function AppShell() {

  const { darkMode } = useTheme();

  const token = localStorage.getItem("token");


  return (

    <div className={darkMode ? "app dark" : "app"}>

      <BrowserRouter>

        <ToastContainer />


        {
          token && (

            <Navbar />

          )
        }



        <div className="main-content">


          <Routes>


            <Route
              path="/"
              element={<Navigate to="/login" />}
            />


            <Route
              path="/login"
              element={<Login />}
            />


            <Route
              path="/register"
              element={<Register />}
            />


            <Route
              path="/confirm/:token"
              element={<ConfirmMeter />}
            />


            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />


            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />


            <Route
              path="/transfers"
              element={
                <ProtectedRoute>
                  <Transfers />
                </ProtectedRoute>
              }
            />


            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateTransfer />
                </ProtectedRoute>
              }
            />


            <Route
              path="/edit-transfer/:id"
              element={
                <ProtectedRoute>
                  <EditTransfer />
                </ProtectedRoute>
              }
            />


            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />


            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />


            <Route
              path="/add-expense"
              element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              }
            />


            <Route
              path="/cards"
              element={
                <ProtectedRoute>
                  <Cards />
                </ProtectedRoute>
              }
            />


            <Route
              path="/cards/callback"
              element={
                <ProtectedRoute>
                  <CardcomCallback />
                </ProtectedRoute>
              }
            />


            <Route
              path="/utilities/:type"
              element={
                <ProtectedRoute>
                  <UtilityDetail />
                </ProtectedRoute>
              }
            />


            <Route
              path="/checklist"
              element={
                <ProtectedRoute>
                  <Checklist />
                </ProtectedRoute>
              }
            />


            <Route
              path="/premium"
              element={
                <ProtectedRoute>
                  <Premium />
                </ProtectedRoute>
              }
            />


            <Route
              path="/referrals"
              element={
                <ProtectedRoute>
                  <Referrals />
                </ProtectedRoute>
              }
            />


            <Route
              path="/address-history"
              element={
                <ProtectedRoute>
                  <AddressHistory />
                </ProtectedRoute>
              }
            />


            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />


            <Route
              path="*"
              element={<Navigate to="/dashboard" />}
            />


          </Routes>


        </div>


      </BrowserRouter>


    </div>

  );

}


function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AppShell />
      </CurrencyProvider>
    </ThemeProvider>
  );
}


export default App;