
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Play, Users, FileText } from 'lucide-react';
import { Investigation } from '../../types';
import CharacterDetails from './CharacterDetails';

interface InvestigationPreviewProps {
  investigation: Investigation;
  onStartGame?: () => void;
  showGameButton?: boolean;
}

const InvestigationPreview: React.FC<InvestigationPreviewProps> = ({
  investigation,
  onStartGame,
  showGameButton = false
}) => {
  return (
    <div className="space-y-6">
      {/* En-tête de l'investigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{investigation.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {investigation.status || 'en_cours'}
              </Badge>
              {showGameButton && onStartGame && (
                <Button onClick={onStartGame} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Jouer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Contexte de l'enquête</h4>
              <p className="text-gray-600">{investigation.prompt}</p>
            </div>
            
            {investigation.player_role && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Votre rôle</h4>
                <Badge variant="secondary">{investigation.player_role}</Badge>
              </div>
            )}

            {investigation.background_url && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Arrière-plan de l'enquête</h4>
                <img 
                  src={investigation.background_url} 
                  alt="Arrière-plan de l'enquête"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Personnages</p>
                <p className="text-2xl font-bold">{investigation.characters?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Indices</p>
                <p className="text-2xl font-bold">{investigation.clues?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Badge className="w-8 h-8 flex items-center justify-center">
                {investigation.characters?.filter(c => c.role === 'suspect').length || 0}
              </Badge>
              <div>
                <p className="text-sm text-gray-600">Suspects</p>
                <p className="text-2xl font-bold text-red-500">
                  {investigation.characters?.filter(c => c.role === 'suspect').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des personnages */}
      {investigation.characters && investigation.characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Personnages de l'enquête
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investigation.characters.map((character) => (
                <CharacterDetails key={character.id} character={character} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestigationPreview;
