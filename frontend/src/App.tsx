import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// layout
import ProtectedRoute from "./components/layout/ProtectedRoute";

// auth pages
import LoginPage          from "./pages/auth/LoginPage";
import SignupPage         from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage    from "./pages/auth/VerifyEmailPage";

// feature pages
import HomePage      from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";