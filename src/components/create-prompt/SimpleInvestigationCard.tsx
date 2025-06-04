
import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SimpleInvestigationCardProps {
  prompt: string;
  onCreateSimpleInvestigation: () => void;
}

const SimpleInvestigationCard: React.FC<SimpleInvestigationCardProps> = ({
  prompt,
  onCreateSimpleInvestigation,
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Ou créer une enquête simple</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-gray-400 text-sm">
          <p>💡 Vous pouvez aussi créer une enquête basique sans IA</p>
          <p>✨ Vous pourrez ajouter des personnages manuellement plus tard</p>
        </div>
        
        <Button
          onClick={onCreateSimpleInvestigation}
          disabled={!prompt.trim()}
          variant="outline"
          className="w-full"
        >
          Créer Enquête Simple
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimpleInvestigationCard;
