import Link from 'next/link';
import { getLocale } from 'next-intl/server';

export default async function SplitSheetsPage() {
    const locale = await getLocale();

    return (
        <div>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Split Sheets</h1>
                    <p className="text-gray-400">View and manage your registered agreements.</p>
                </div>
                <Link href={`/${locale}/dashboard/create`} className="px-5 py-2 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all">
                    + Create New
                </Link>
            </header>

            <div className="glass-panel overflow-hidden rounded-xl">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-xs uppercase font-bold text-white">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {/* Empty State / Placeholder */}
                        <tr>
                            <td className="px-6 py-8 text-center" colSpan={4}>
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                        <span className="text-xl">📄</span>
                                    </div>
                                    <p className="text-white font-medium">No split sheets found</p>
                                    <p className="text-sm text-gray-500 mb-4">Start by creating your first agreement.</p>
                                    <Link href={`/${locale}/dashboard/create`} className="text-primary hover:underline text-xs">Create Split Sheet &rarr;</Link>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
