import { Navigate, Route, Routes } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import Layout from './components/Layout.jsx';
import Auth from './pages/Auth.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx'; 
import StudentExams from './pages/StudentExams.jsx';
import StudentResults from './pages/StudentResults.jsx'; 
import StudentProfile from './pages/StudentProfile.jsx';
import ExamStart from './pages/ExamStart.jsx'; 
import ExamRoom from './pages/ExamRoom.jsx'; 
import Result from './pages/Result.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminExams from './pages/AdminExams.jsx'; 
import AdminQuestions from './pages/AdminQuestions.jsx';
import AdminStudents from './pages/AdminStudents.jsx'; 
import AdminAttempts from './pages/AdminAttempts.jsx'; 
import AttemptReport from './pages/AttemptReport.jsx';
import AdminLive from './pages/AdminLive.jsx';
const S = ({ children, layout = true }) => <ProtectedRoute role="student">{layout ? <Layout>{children}</Layout> : children}</ProtectedRoute>;
const A = ({ children }) => <ProtectedRoute role="admin"><Layout>{children}</Layout></ProtectedRoute>;
export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} />
    <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} replace />} />
    <Route path="/student" element={<S><StudentDashboard /></S>} />
    <Route path="/student/exams" element={<S><StudentExams /></S>} />
    <Route path="/student/results" element={<S><StudentResults /></S>} />
    <Route path="/student/profile" element={<S><StudentProfile /></S>} />
    <Route path="/exam/:examId/start" element={<S layout={false}><ExamStart /></S>} />
    <Route path="/exam/attempt/:attemptId" element={<S layout={false}><ExamRoom /></S>} />
    <Route path="/result/:id" element={<S><Result /></S>} />
    <Route path="/admin" element={<A><AdminDashboard /></A>} /><Route path="/admin/exams" element={<A><AdminExams /></A>} />
    <Route path="/admin/live" element={<A><AdminLive /></A>} />
    <Route path="/admin/exams/:examId/questions" element={<A><AdminQuestions /></A>} /><Route path="/admin/students" element={<A><AdminStudents /></A>} />
    <Route path="/admin/attempts" element={<A><AdminAttempts /></A>} /><Route path="/admin/attempts/:id" element={<A><AttemptReport /></A>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
