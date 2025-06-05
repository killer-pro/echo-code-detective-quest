
import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Book, Save, Settings, Target } from 'lucide-react';
import { Investigation, GameResult } from '../../types';

interface GameUIProps {
  investigation: Investigation;
  assetsInitialized: boolean;
  onNavigateHome: () => void;
  onToggleJournal: () => void;
  onToggleMenu: () => void;
  onSaveGame: () => void;
  onShowAccusation: () => void;
  isSaving: boolean;
  isJournalOpen: boolean;
  isMenuOpen: boolean;
  isGameFinished: boolean;
  gameResult: GameResult;
  playerStats: {
    dialogCount: number;
    leadsCount: number;
    alertedCharacters: number;
    totalCharacters: number;
  };
}

const GameUI: React.FC<GameUIProps> = ({
  investigation,
  assetsInitialized,
  onNavigateHome,
  onToggleJournal,
  onToggleMenu,
  onSaveGame,
  onShowAccusation,
  isSaving,
  isJournalOpen,
  isMenuOpen,
  isGameFinished,
  gameResult,
  playerStats
}) => {
  const getGameStatusColor = () => {
    switch (gameResult) {
      case 'won': return 'text-green-400';
      case 'lost': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getGameStatusText = () => {
    switch (gameResult) {
      case 'won': return '🎉 Investigation solved!';
      case 'lost': return '❌ Investigation failed';
      default: return assetsInitialized ? 'Investigation active' : 'Loading assets...';
    }
  };

  return (
    <>
      {/* Enhanced header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onNavigateHome}
              className="text-gray-300 hover:text-white hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="border-l border-slate-600 pl-4">
              <h1 className="text-xl font-bold text-white">{investigation.title}</h1>
              <p className={`text-sm flex items-center gap-2 ${getGameStatusColor()}`}>
                <div className={`w-2 h-2 rounded-full ${
                  gameResult === 'won' ? 'bg-green-400' : 
                  gameResult === 'lost' ? 'bg-red-400' : 
                  assetsInitialized ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                {getGameStatusText()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isGameFinished && (
              <>
                <Button
                  onClick={onSaveGame}
                  disabled={isSaving}
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>

                <Button
                  onClick={onShowAccusation}
                  disabled={playerStats.dialogCount < 3}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  title={playerStats.dialogCount < 3 ? 'Interrogate at least 3 characters before accusing' : 'Accuse the culprit'}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Accuse
                </Button>
              </>
            )}

            <Button
              onClick={onToggleJournal}
              variant={isJournalOpen ? "default" : "outline"}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <Book className="w-4 h-4 mr-2" />
              Journal
            </Button>

            <Button
              onClick={onToggleMenu}
              variant={isMenuOpen ? "default" : "outline"}
              className="text-gray-300 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced statistics overlay */}
      {assetsInitialized && (
        <div className="absolute top-50 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white z-10 border border-slate-600">
          <div className="text-xs text-gray-300 mb-2 font-semibold">Investigation Progress</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">💬</span>
              <span>{playerStats.dialogCount} dialogues</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🕵️</span>
              <span>{playerStats.leadsCount} clues</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">👥</span>
              <span>{playerStats.alertedCharacters}/{playerStats.totalCharacters} alerted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">🎯</span>
              <span>{Math.round((playerStats.leadsCount / Math.max(playerStats.dialogCount, 1)) * 100)}% efficiency</span>
            </div>
          </div>
          
          {isGameFinished && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <div className={`text-center font-semibold ${getGameStatusColor()}`}>
                {gameResult === 'won' ? '🏆 Victory!' : '💀 Defeat'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced instructions */}
      <div className="absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 p-3 z-10">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-300">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {!isGameFinished ? (
              <>
                <span className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↑↓←→</kbd>
                  <span>Move</span>
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">SPACE</kbd>
                  <span>Interact</span>
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">CLICK</kbd>
                  <span>Select</span>
                </span>
                <span className="text-yellow-400">💾 Save your progress regularly</span>
                <span className="text-red-400">🎯 Gather clues before accusing</span>
              </>
            ) : (
              <span className={getGameStatusColor()}>
                {gameResult === 'won' 
                  ? '🎉 Congratulations! You solved the investigation!' 
                  : '😞 Investigation failed. The real culprit gets away...'}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GameUI;
