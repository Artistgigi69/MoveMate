import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DraftProvider } from "./draft";
import { I18nProvider } from "./i18n";
import Home from "./screens/Home";
import Addresses from "./screens/Addresses";
import Services from "./screens/Services";
import Details from "./screens/Details";
import Auth from "./screens/Auth";
import Submit from "./screens/Submit";
import { StatusDetail, StatusList } from "./screens/Status";
import Confirm from "./screens/Confirm";
import { Forgot, Reset } from "./screens/Reset";
import Legal from "./screens/Legal";
import { DeleteAccount } from "./screens/Account";
import Admin from "./screens/Admin";

import { api } from "./api";

import "./styles.css";

api.wake();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <DraftProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/services" element={<Services />} />
            <Route path="/details" element={<Details />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/status" element={<StatusList />} />
            <Route path="/status/:id" element={<StatusDetail />} />
            <Route path="/confirm/:token" element={<Confirm />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset/:token" element={<Reset />} />
            <Route path="/privacy" element={<Legal doc="privacy" />} />
            <Route path="/terms" element={<Legal doc="terms" />} />
            <Route path="/account/delete" element={<DeleteAccount />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DraftProvider>
      </BrowserRouter>
    </I18nProvider>
  </StrictMode>
);
