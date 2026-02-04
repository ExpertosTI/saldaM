import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <Sidebar />
            {/* pt-16 on mobile for header, ml-64 on desktop for sidebar */}
            <main className="lg:ml-64 ml-0 pt-16 lg:pt-0 min-h-screen p-4 lg:p-8">
                {children}
            </main>
        </div>
    );
}
