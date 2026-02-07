import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log unknown paths for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Unknown path:', location.pathname);
    }
  }, [location]);

  // Check if this looks like a tracking/analytics URL (UUID-like path)
  const isTrackingUrl = /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(location.pathname);

  // Silently redirect tracking URLs without showing 404
  if (isTrackingUrl) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-[#3B5BFF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-[#3B5BFF]" />
        </div>
        <h1 className="text-4xl font-bold text-[#0B0E14] mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[#0B0E14] mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
