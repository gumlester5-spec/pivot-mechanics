import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import TrackerView from './components/TrackerView';
import AdminDashboard from './components/AdminDashboard';
import NewOrderForm from './components/NewOrderForm';
import OrderDetail from './components/OrderDetail';
import BottomNavigation from './components/BottomNavigation';
import Login from './components/Login'; // <--- IMPORTAR LOGIN
import HistoryView from './components/HistoryView'; // <--- IMPORTAR HISTORIAL
import ProfileView from './components/ProfileView'; // <--- IMPORTAR PERFIL
import './App.css';

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
        {/* 1. La ruta raíz ahora es el Login */}
        <Route path="/" element={<Login />} />

        {/* 2. Ruta para el cliente (Rastreador) */}
        <Route path="/tracker" element={<TrackerView />} />

        {/* 3. Rutas protegidas del Admin/Mecánico */}
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Route>

        <Route path="/admin/new" element={<NewOrderForm />} />
        <Route path="/admin/orders/:id" element={<OrderDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
