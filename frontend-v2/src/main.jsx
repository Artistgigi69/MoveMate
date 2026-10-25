import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DraftProvider } from "./draft";
import Home from "./screens/Home";
import Addresses from "./screens/Addresses";
import Services from "./screens/Services";
import Details from "./screens/Details";
import Auth from "./screens/Auth";
import Submit from "./screens/Submit";
import { StatusDetail, StatusList } from "./screens/Status";

import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DraftProvider>
    </BrowserRouter>
  </StrictMode>
);
