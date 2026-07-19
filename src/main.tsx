import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Landing from "./pages/Landing.tsx";
import QrDetail from "./pages/Qrdetail.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<App />} />
        <Route path="/qr/:id" element={<QrDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
