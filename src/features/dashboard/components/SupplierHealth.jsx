const providers = [
  { initial: 'L', name: 'Logitech',   status: 'ok' },
  { initial: 'A', name: 'AWS Global', status: 'ok' },
  { initial: 'S', name: 'SteelWorks', status: 'warning' },
]

export default function SupplierHealth() {
  return (
    <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl shadow-sm">
      <h3 className="font-label-md text-label-md text-on-surface mb-md">
        Top Providers Health
      </h3>
      <div className="space-y-4">
        {providers.map(({ initial, name, status }) => (
          <div key={name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                {initial}
              </div>
              <span className="text-body-sm font-label-md">{name}</span>
            </div>
            {status === 'ok' ? (
              <span className="text-[#62C234] material-symbols-outlined">check_circle</span>
            ) : (
              <span className="text-tertiary-fixed-dim material-symbols-outlined">warning</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
