import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import InvoiceList from './components/InvoiceList'
import InvoiceForm from './components/InvoiceForm'
import InvoicePrint from './components/InvoicePrint'
import ClientList from './components/ClientList'
import Settings from './components/Settings'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<InvoiceForm />} />
          <Route path="invoices/:id" element={<InvoiceRedirect />} />
          <Route path="invoices/:id/edit" element={<InvoiceForm />} />
          <Route path="invoices/:id/print" element={<InvoicePrint />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

function InvoiceRedirect() {
  const { id } = useParams()
  if (!id) return <Navigate to="/invoices" replace />
  return <Navigate to={`/invoices/${id}/print`} replace />
}

export default App