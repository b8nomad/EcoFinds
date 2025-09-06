import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoleBasedRedirect } from './components/RoleBasedRedirect';
import { ProtectedRoute } from './components/ProtectedRoute';

import AdminHome from "@/pages/Admin/Home";
import UserHome from "@/pages/User/Home";

import Login from '@/pages/Auth/Login';
import Signup from '@/pages/Auth/Signup';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Root route - redirects based on authentication and role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Public routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />


          {/* Protected Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute userType='ADMIN'>
              <Routes>
                <Route path="/" element={<AdminHome />} />
              </Routes>
            </ProtectedRoute>
          } />

          {/* Protected User routes */}
          <Route path="/user/*" element={
            <ProtectedRoute userType='USER'>
              <Routes>
                <Route path="/" element={<UserHome />} />
              </Routes>
            </ProtectedRoute>
          } />

        </Routes>
      </div>
    </Router>
  )
}

export default App