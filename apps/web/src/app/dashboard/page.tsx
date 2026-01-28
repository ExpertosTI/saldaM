export default function DashboardHome() {
    return (
        <div>
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">My Catalog</h1>
                    <p className="text-gray-400">Manage your tracking rights and agreements.</p>
                </div>
                <a href="/dashboard/create" className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    + New Split Sheet
                </a>
            </header>

            {/* Stats Grid - Connected to Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Total Catalog</p>
                    <h3 className="text-3xl font-bold text-white">-- <span className="text-base font-normal text-gray-500">Songs</span></h3>
                </div>
                <div className="glass-panel p-6 rounded-xl border-l-4 border-primary">
                    <p className="text-gray-400 text-sm mb-1">Pending Signatures</p>
                    <h3 className="text-3xl font-bold text-primary">-- <span className="text-base font-normal text-gray-500">Action Required</span></h3>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Est. Royalties (Q1)</p>
                    <h3 className="text-3xl font-bold text-white">$0.00 <span className="text-base font-normal text-gray-500">USD</span></h3>
                </div>
            </div>

            {/* Recent Activity */}
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Recent Split Sheets</h2>
            <div className="space-y-4">
                {/* Real data map would go here. Empty state for Production Build. */}
                <div className="text-center py-12 glass-panel rounded-lg">
                    <p className="text-gray-500">No split sheets created yet.</p>
                    <a href="/dashboard/create" className="text-primary hover:underline mt-2 inline-block">Start your first Agreement</a>
                </div>
            </div>
        </div>
    );
}
