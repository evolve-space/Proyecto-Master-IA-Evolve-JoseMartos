import SummaryCards from '../components/SummaryCards'
import RecentActivity from '../components/RecentActivity'
import ActionCard from '../components/ActionCard'
import SupplierHealth from '../components/SupplierHealth'
import SystemMessage from '../components/SystemMessage'
import FloatingActionButton from '../../../components/ui/FloatingActionButton'

export default function DashboardPage() {
  return (
    <>
      {/* Bento grid de resumen */}
      <SummaryCards />

      {/* Cuerpo del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Actividad reciente — ocupa 2/3 */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Panel lateral — ocupa 1/3 */}
        <div className="flex flex-col gap-gutter">
          <ActionCard />
          <SupplierHealth />
          <SystemMessage />
        </div>
      </div>

      <FloatingActionButton />
    </>
  )
}

