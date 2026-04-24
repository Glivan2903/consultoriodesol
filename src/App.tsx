import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Incoming from './pages/Incoming';
import Outgoing from './pages/Outgoing';
import Clients_ from './pages/Clients';
import Companies from './pages/Companies';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import MedicalRecords from './pages/MedicalRecords';
import { ProtectedRoute, PublicRoute } from './components/AuthRoutes';
import { useAuth } from './context/AuthContext';

function AppLayout() {
  const { session } = useAuth();
  
  if (!session) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-slate-50 print:bg-white print:block">
      <div className="print:hidden h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col print:block">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="p-4 md:p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible print:h-auto">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/categorias" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/entradas" element={<ProtectedRoute><Incoming /></ProtectedRoute>} />
            <Route path="/saidas" element={<ProtectedRoute><Outgoing /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clients_ /></ProtectedRoute>} />
            <Route path="/empresas" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="/movimentacoes" element={<ProtectedRoute><Movements /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/prontuarios" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
            <Route path="/prontuarios/:clientId" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;