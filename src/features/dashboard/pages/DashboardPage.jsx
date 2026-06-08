import { useState, useEffect } from 'react'
import { ofertasService }       from '../../ofertas/services/ofertasService'
import { contratosService }     from '../../contratos/services/contratosService'
import { muestrasService }      from '../../muestras/services/muestrasService'
import { importacionesService } from '../../importaciones/services/importacionesService'
import { proveedoresService }   from '../../proveedores/services/proveedoresService'
import { dashboardService }     from '../services/dashboardService'
import SummaryCards             from '../components/SummaryCards'
import RecentActivity           from '../components/RecentActivity'
import ActionCard               from '../components/ActionCard'
import SupplierHealth           from '../components/SupplierHealth'
import CalendarAlerts           from '../components/CalendarAlerts'
import { MonthlyImportsChart, MuestrasDonut } from '../components/Charts'

export default function DashboardPage() {
  const [data, setData]       = useState(null)
  const [alertData, setAlertData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    Promise.all([
      ofertasService.getAll(),
      contratosService.getAll(),
      muestrasService.getAll(),
      importacionesService.getAll(),
      proveedoresService.getAll(),
      dashboardService.getAlerts().catch(() => null),
    ])
      .then(([ofertas, contratos, muestras, importaciones, proveedores, alerts]) => {
        setData({ ofertas, contratos, muestras, importaciones, proveedores })
        setAlertData(alerts)
      })
      .catch((err) => {
        console.error(err)
        setError(err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400 text-sm">Cargando dashboard…</p>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400 text-sm">
        Error al cargar el dashboard. Verifica que el servidor esté activo.
      </p>
    </div>
  )

  const { ofertas, contratos, muestras, importaciones, proveedores } = data

  const now      = new Date()
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const thisYear = now.getFullYear()

  const contratosProxVencer = contratos.filter(c =>
    c.fechaCaducidad &&
    new Date(c.fechaCaducidad) >= now &&
    new Date(c.fechaCaducidad) <= in30days
  )
  const muestrasAnalisis   = muestras.filter(m => m.estado === 'Análisis')
  const importYear   = importaciones.filter(i => i.fechaDuaAlbaran?.startsWith(String(thisYear)))
  const totalKgYear  = importYear.reduce((s, i) => s + parseFloat(i.cantidad   ?? 0), 0)
  const totalEurYear = importaciones.reduce((s, i) => s + parseFloat(i.importeEur ?? 0), 0)
  const recentOfertas = [...ofertas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 8)

  return (
    <>
      <SummaryCards
        ofertas={ofertas}
        contratos={contratos}
        contratosProxVencer={contratosProxVencer}
        muestras={muestras}
        muestrasAnalisis={muestrasAnalisis}
        importYear={importYear}
        totalKgYear={totalKgYear}
        totalEurYear={totalEurYear}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna izquierda — tabla + gráficas */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <RecentActivity ofertas={recentOfertas} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <MonthlyImportsChart importaciones={importaciones} />
            </div>
            <MuestrasDonut muestras={muestras} />
          </div>
        </div>

        {/* Columna derecha — acciones + proveedores + alertas */}
        <div className="flex flex-col gap-6">
          <ActionCard />
          <CalendarAlerts
            upcomingEvents={alertData?.upcomingEvents ?? []}
            eventsNext24h={alertData?.eventsNext24h ?? 0}
          />
          <SupplierHealth proveedores={proveedores} ofertas={ofertas} contratos={contratos} />
        </div>
      </div>

    </>
  )
}
