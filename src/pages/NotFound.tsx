import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-brand-pale flex items-center justify-center mb-4">
        <Truck className="h-6 w-6 text-brand-primary" />
      </div>
      <h1 className="text-2xl font-extrabold text-brand-navy">Page not found</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">The page you're looking for doesn't exist or may have been moved.</p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
