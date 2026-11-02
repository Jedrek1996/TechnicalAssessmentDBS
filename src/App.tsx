import { Header } from './components/layout/Header'
import { useCustomer } from './hooks/useCustomer'
import { DashboardPage } from './pages/DashboardPage'
import { customerInitials } from './utils/customer'

export default function App() {
  const customer = useCustomer()

  return (
    <>
      <Header initials={customer.data && customerInitials(customer.data)} />
      <DashboardPage />
    </>
  )
}
