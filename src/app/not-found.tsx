import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="text-center p-8 rounded-xl shadow-lg bg-white/80">
        <div className="mb-8">
          <h1 className="text-7xl font-extrabold text-purple-700 mb-4">🚧</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Page Under Development</h2>
          <p className="text-lg text-gray-600 mb-2">
            This page is coming soon with an awesome design!
          </p>
          <p className="text-gray-500">
            We&apos;re working hard to bring you something amazing. Stay tuned!
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/" 
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Go back home
          </Link>
          
          <div className="text-sm text-gray-500 mt-4">
            <p>If you believe this is an error, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}