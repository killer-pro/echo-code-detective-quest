
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Wand2, Play, BookOpen, Brain, Users, Search, MessageSquare } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Générative",
      description: "Dialogues dynamiques avec personnalités uniques et mémoire persistante"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Réputation Sociale",
      description: "Vos interactions influencent la coopération des témoins"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Indices Flous",
      description: "Informations incertaines, mensonges et fausses pistes"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Dialogues Avancés",
      description: "Historique cliquable et mots-clés interactifs"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.05%27%3E%3Ccircle%20cx=%2730%27%20cy=%2730%27%20r=%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30 px-4 py-2">
                <Wand2 className="w-4 h-4 mr-2" />
                Propulsé par l'IA Gemini
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Echo<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Code</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plongez dans des enquêtes procédurales où chaque dialogue compte. 
              Explorez des mystères générés par IA avec des personnages qui se souviennent, mentent et évoluent.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Créer une enquête
              </Button>
              
              <Button 
                onClick={() => navigate('/game')}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Enquête de démo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Une expérience d'enquête révolutionnaire
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Découvrez un gameplay d'enquête où l'intelligence artificielle crée des interactions sociales complexes et réalistes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-800/30 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comment ça fonctionne
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Créez votre enquête</h3>
              <p className="text-gray-400">Décrivez un scénario et laissez l'IA générer personnages, lieux et mystères</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Explorez et interrogez</h3>
              <p className="text-gray-400">Naviguez sur la carte, interagissez avec les personnages et collectez des indices</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Résolvez le mystère</h3>
              <p className="text-gray-400">Utilisez votre journal d'enquête pour rassembler les pièces du puzzle</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à commencer votre enquête ?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Créez des histoires uniques où chaque conversation révèle de nouveaux secrets et où vos choix façonnent l'enquête.
            </p>
            <Button 
              onClick={() => navigate('/create')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Lancer le générateur
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>EchoCode - Enquêtes procédurales alimentées par l'IA</p>
            <p className="text-sm mt-2">Développé avec React, Phaser 3, et l'API Gemini</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
