import { getDashboard } from '@/lib/api/dashboard';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardContent from './components/DashboardContent';



// Main page component – async server component
export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof getDashboard>>;
  let error: string | null = null;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    data = await getDashboard(cookieHeader);
  } catch (err: any) {
    // If the error is due to missing auth, redirect to login
    if (err.message === 'Unauthorized') {
      redirect('/login?from=/dashboard');
    }
    error = err.message || 'Failed to load dashboard';
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Try again
        </Link>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8">No data available</div>;
  }

  return <DashboardContent data={data} />;
}