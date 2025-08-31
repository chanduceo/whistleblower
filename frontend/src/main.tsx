import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import ReviewDashboard from "./pages/ReviewDashboard";
import ComplaintView from "./pages/ComplaintView";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/submit" />} />
          <Route path="submit" element={<SubmitComplaint />} />
          <Route path="mine" element={<MyComplaints />} />
          <Route path="review" element={<ReviewDashboard />} />
          <Route path="complaint/:id" element={<ComplaintView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);