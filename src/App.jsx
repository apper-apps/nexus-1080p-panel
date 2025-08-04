import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import ContactsPage from "@/components/pages/ContactsPage"
import DashboardPage from "@/components/pages/DashboardPage"
import DealsPage from "@/components/pages/DealsPage"
import CompaniesPage from "@/components/pages/CompaniesPage"
import ReportsPage from "@/components/pages/ReportsPage"
import ActivityPage from "@/components/pages/ActivityPage"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
<Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/contacts" replace />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App