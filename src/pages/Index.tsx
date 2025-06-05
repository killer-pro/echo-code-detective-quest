import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Wand2, Play, BookOpen, Brain, Users, Search, MessageSquare } from 'lucide-react';
import ActiveInvestigations from '../components/ActiveInvestigations';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Generative AI",
      description: "Dynamic dialogues with unique personalities and persistent memory"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Reputation",
      description: "Your interactions influence witness cooperation"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Blurred Clues",
      description: "Uncertain information, lies and red herrings"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Advanced Dialogues",
      description: "Clickable history and interactive keywords"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.05%27%3E%3Ccircle%20cx=%2730%27%20cy=%2730%27%20r=%272%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30 px-3 md:px-4 py-1 md:py-2 text-sm md:text-base">
                <Wand2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Powered by Gemini AI + Cloudinary
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Echo<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Code</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Dive into procedural investigations where every dialogue matters. 
              Explore AI-generated mysteries with characters who remember, lie, and evolve.
            </p>
            
            <div className="flex flex-col gap-4 justify-center items-center px-4 max-w-md mx-auto">
              <Button 
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full"
              >
                <Wand2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Create Investigation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Investigations Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <ActiveInvestigations />
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            A revolutionary investigation experience
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Discover investigation gameplay where artificial intelligence creates complex and realistic social interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-base md:text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/30 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Create your investigation</h3>
              <p className="text-gray-400 text-sm md:text-base px-4">Describe a scenario and let AI generate characters, locations and mysteries</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Explore and interrogate</h3>
              <p className="text-gray-400 text-sm md:text-base px-4">Navigate the map, interact with characters and collect clues</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-lg md:text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white mb-3">Solve the mystery</h3>
              <p className="text-gray-400 text-sm md:text-base px-4">Use your investigation journal to piece together the puzzle</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
          <CardContent className="p-8 md:p-12 text-center">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start your investigation?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Create unique stories where every conversation reveals new secrets and your choices shape the investigation.
            </p>
            <div className="flex justify-center px-4 max-w-md mx-auto">
              <Button 
                onClick={() => navigate('/create')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg w-full"
              >
                <Wand2 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Launch Generator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="text-center text-gray-400">
            <p className="text-sm md:text-base">Echo Code Detective - AI-powered procedural investigations</p>
            <p className="text-xs md:text-sm mt-2">Built with React, Phaser 3, Gemini API and Cloudinary</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
