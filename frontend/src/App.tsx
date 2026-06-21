import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";


import ProtectedRoute from "./components/layout/ProtectedRoute";


import LoginPage          from "./pages/auth/LoginPage";
import SignupPage         from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage    from "./pages/auth/VerifyEmailPage";


import HomePage      from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";

import ChatbotPage from "./pages/features/chatbot";


const App=()=>{
  return(
    <AuthProvider>

      <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/signup"         element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email"   element={<VerifyEmailPage />} />

            <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
              <ProfilePage />
              <ChatbotPage />
            </ProtectedRoute>
          } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </BrowserRouter>

    </AuthProvider>
  );
};


export default App;