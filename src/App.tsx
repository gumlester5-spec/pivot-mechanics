import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import TrackerView from './components/TrackerView';
import AdminDashboard from './components/AdminDashboard';
import NewOrderForm from './components/NewOrderForm';
import BottomNavigation from './components/BottomNavigation';
import './App.css';

// Layout component that includes the BottomNavigation
const MainLayout = () => {
  return (
    <>
      <Outlet />
      <BottomNavigation />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Client Tracker */}
        <Route path="/" element={<TrackerView />} />

        {/* Admin Routes - Wrapped in Layout for Navigation */}
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/history" element={<div style={{ padding: 20 }}>Historial (Próximamente)</div>} />
          <Route path="/profile" element={<div style={{ padding: 20 }}>Perfil (Próximamente)</div>} />
        </Route>

        {/* Full screen form (no bottom nav) */}
        <Route path="/admin/new" element={<NewOrderForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
