import { useAdminDashboard } from './useAdminDashboard';
import {
  IconUsers,
  IconBuilding,
  IconSettings,
  IconLink
} from '@tabler/icons-react';

export default function AdminDashboard() {
  const { stats, loading, error, loadStats } = useAdminDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <h3 className="font-semibold">Error</h3>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadStats}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Panel Administrativo</h2>
        <p className="mt-1 text-sm text-gray-500">
          Estadísticas generales del sistema
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Usuarios"
          value={stats.total_users}
          icon={<IconUsers size={28} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Compañías"
          value={stats.total_companies}
          icon={<IconBuilding size={28} />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Servicios"
          value={stats.total_services}
          icon={<IconSettings size={28} />}
          color="bg-purple-500"
        />
        <StatCard
          title="Asignaciones Activas"
          value={stats.total_assignments}
          icon={<IconLink size={28} />}
          color="bg-orange-500"
        />
      </div>

      {/* Nuevos usuarios */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">
          Usuarios Recientes (últimos 7 días)
        </h3>
        <p className="mt-2 text-3xl font-bold text-blue-600">
          {stats.recent_users}
        </p>
      </div>

      {/* Distribución de usuarios por compañía */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Usuarios por Compañía (Top 10)
        </h3>
        <div className="space-y-3">
          {stats.users_by_company.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900">
                  {item.company_name}
                </span>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                {item.user_count} usuario{item.user_count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`shrink-0 rounded-md ${color} p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">
                {title}
              </dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
