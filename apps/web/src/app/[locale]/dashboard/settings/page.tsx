export default function SettingsPage() {
    return (
        <div className="max-w-2xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-gray-400">Update your profile and preferences.</p>
            </header>

            <div className="space-y-6">
                {/* Profile Section */}
                <section className="glass-panel p-6 rounded-xl space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Stage Name</label>
                            <input type="text" placeholder="e.g. Bad Bunny" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Legal Name</label>
                            <input type="text" placeholder="Full Legal Name" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                            <input type="email" value="user@example.com" disabled className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed" />
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="glass-panel p-6 rounded-xl space-y-4">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2">Notifications</h2>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-6 rounded-full bg-primary p-1 relative">
                                <div className="w-4 h-4 rounded-full bg-black absolute right-1"></div>
                            </div>
                            <span className="text-gray-300 group-hover:text-white">Email alerts for new signatures</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-6 rounded-full bg-neutral-700 p-1 relative">
                                <div className="w-4 h-4 rounded-full bg-white absolute left-1"></div>
                            </div>
                            <span className="text-gray-300 group-hover:text-white">Marketing updates</span>
                        </label>
                    </div>
                </section>

                <div className="flex justify-end gap-3 pt-4">
                    <button className="px-6 py-2 rounded-lg text-gray-400 hover:text-white">Cancel</button>
                    <button className="px-6 py-2 rounded-lg bg-primary text-black font-bold hover:brightness-110 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
