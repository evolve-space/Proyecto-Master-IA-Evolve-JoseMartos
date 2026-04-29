export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">

      {/* Total Orders */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-container/10 rounded-lg text-[#62C234]">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <span className="text-primary font-label-sm text-label-sm flex items-center bg-primary/5 px-2 py-1 rounded">
            +12.5%
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Total Orders</p>
        <h2 className="font-h2 text-h2 text-on-surface">1,284</h2>
        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '65%' }} />
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-tertiary-container/10 rounded-lg text-tertiary">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <span className="text-on-tertiary-container font-label-sm text-label-sm flex items-center bg-tertiary-container/20 px-2 py-1 rounded">
            Action Needed
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Pending Approvals</p>
        <h2 className="font-h2 text-h2 text-on-surface">42</h2>
        <div className="mt-4 flex -space-x-2">
          <img
            className="w-8 h-8 rounded-full border-2 border-white"
            alt="Reviewer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCchXGI7hw3kHK9Z36MMrtBGr2djODfHYTamJbj0Xa8vZsIn3YwN2FqWlVkfqiEvGF1tLp66P7Do8eKR1IllJkP0_ZaDCuv4OCxLvnkBqdoQcaiHgFI6jeJ4tlsMnZ8JcvT1U0LCd9A8knmu5NUfaUHQ_vpC891qS3ql4mnIRWVxYP_FfjhOZk5Wehz_tHN_CY6MFcOhsajBm6Lg_dv-CiCPsQyENy_jbBLgvtkPcjyBrfin2ONcXumWk9P-Pjtr8mf7iQqj4OF8rU"
          />
          <img
            className="w-8 h-8 rounded-full border-2 border-white"
            alt="Reviewer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKM8qLkTgNFmiPn4bcl-Eyk_466rgmX7Wl98rOKhCt0vgeKAjWH9PLI1HMtvFIfM10L_zkhWuza59VQOhUS2XnhyvkyUlFbbsNNfMvuQ5xkvffLlC0bWMQEA25Uq-RG-OfQeM5VP6qqhGmUHzzVXKFLfN9LfyCA0dfAl3OcVR85U6EzxVnM08QHANZGLPyz3R_QnUDdB2FqCmIS-6hUeIoc9RAZnSt6Zg4SudhoC5vMYqbyRCvBGu3gtDywBAEW70KllCOeSng72g"
          />
          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
            +39
          </div>
        </div>
      </div>

      {/* Monthly Spend */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-secondary-container/10 rounded-lg text-secondary">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <span className="text-secondary font-label-sm text-label-sm flex items-center bg-secondary-container/20 px-2 py-1 rounded">
            Budget: 84%
          </span>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Monthly Spend</p>
        <h2 className="font-h2 text-h2 text-on-surface">$248.5k</h2>
        <div className="mt-4 flex items-end gap-1 h-8">
          <div className="flex-1 bg-slate-100 rounded-sm h-3" />
          <div className="flex-1 bg-slate-100 rounded-sm h-5" />
          <div className="flex-1 bg-secondary-container rounded-sm h-8" />
          <div className="flex-1 bg-secondary rounded-sm h-6" />
          <div className="flex-1 bg-slate-100 rounded-sm h-4" />
        </div>
      </div>

      {/* Active Quotes */}
      <div className="bg-white border border-[#E2E4D9] p-lg rounded-xl card-hover-shadow transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary-container/10 rounded-lg text-[#62C234]">
            <span className="material-symbols-outlined">request_quote</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-[#62C234] flex items-center justify-center">
            <span className="text-[#62C234] font-bold text-[10px]">8</span>
          </div>
        </div>
        <p className="text-slate-500 font-label-md text-label-md mb-1">Active Quotes</p>
        <h2 className="font-h2 text-h2 text-on-surface">18</h2>
        <p className="text-body-sm font-body-sm text-slate-400 mt-4">4 Expiring within 24h</p>
      </div>

    </div>
  )
}
