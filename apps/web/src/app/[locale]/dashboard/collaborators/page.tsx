export default function CollaboratorsPage() {
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Collaborators</h1>
                <p className="text-gray-400">Manage your network of artists and producers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Collaborator Card */}
                <button className="h-48 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 flex flex-col items-center justify-center text-gray-500 hover:text-white transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                        <span className="text-2xl text-white group-hover:text-primary">+</span>
                    </div>
                    <span className="font-medium">Add Collaborator</span>
                </button>

                {/* Example Entry */}
                <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600"></div>
                    <div>
                        <h3 className="text-white font-bold">Jairo Saldaña</h3>
                        <p className="text-xs text-gray-400">Producer • Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
