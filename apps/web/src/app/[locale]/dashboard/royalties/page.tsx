export default function RoyaltiesPage() {
    return (
        <div>
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Royalties & Analytics</h1>
                    <p className="text-gray-400">Track your earnings and catalog performance.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
            </header>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Total Earnings</p>
                    <h2 className="text-4xl font-bold text-primary">$0.00</h2>
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <span>↑ 0%</span> <span className="text-gray-500">vs last month</span>
                    </p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Top Performing Track</p>
                    <h2 className="text-xl font-bold text-white">--</h2>
                    <p className="text-xs text-gray-500 mt-2">No data yet</p>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Pending Payout</p>
                    <h2 className="text-2xl font-bold text-white">$0.00</h2>
                    <button className="text-xs text-primary hover:underline mt-2">Setup Payout Method</button>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="glass-panel p-6 rounded-xl h-64 flex flex-col items-center justify-center border border-white/5">
                <p className="text-gray-500 mb-2">Earnings over time</p>
                <div className="w-full h-32 flex items-end justify-center gap-2 opacity-30">
                    {[40, 60, 30, 80, 50, 90, 70, 40, 60, 30, 80, 50].map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className="w-4 bg-primary rounded-t-sm"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
