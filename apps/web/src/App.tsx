import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Cashout from "./pages/Cashout";
import CreateInvoice from "./pages/CreateInvoice";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import InvoiceDetail from "./pages/InvoiceDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PayInvoice from "./pages/PayInvoice";
import Receipt from "./pages/Receipt";
import Sep24Demo from "./pages/Sep24Demo";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pay/:id" element={<PayInvoice />} />
      <Route path="/receipt/:id" element={<Receipt />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/invoices" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/invoices" replace />} />
        <Route path="/invoices/new" element={<CreateInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices/:id/cashout" element={<Cashout />} />
        <Route path="/sep24" element={<Sep24Demo />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

