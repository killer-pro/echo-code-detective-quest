
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <Search className="w-24 h-24 text-purple-400 mx-auto opacity-50" />
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300">Page introuvable</h2>
          <p className="text-gray-400">
            Cette page semble avoir disparu mystérieusement... 
            Peut-être une nouvelle enquête pour EchoCode ?
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <Button
            onClick={() => navigate('/create')}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/10"
          >
            Créer une nouvelle enquête
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
