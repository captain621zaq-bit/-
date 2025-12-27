
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateHeroImage, editHeroImage } from './services/geminiService';
import { GeneratedImage, GenerationStatus } from './types';
import { INITIAL_HERO_PROMPT, SUGGESTED_EDITS } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const handleInitialGeneration = async () => {
    try {
      setStatus(GenerationStatus.GENERATING);
      setError(null);
      const result = await generateHeroImage(INITIAL_HERO_PROMPT);
      const newImg: GeneratedImage = {
        url: `data:image/png;base64,${result.base64}`,
        base64: result.base64,
        prompt: INITIAL_HERO_PROMPT,
        timestamp: Date.now()
      };
      setCurrentImage(newImg);
      setHistory(prev => [newImg, ...prev]);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('ヒーローの生成に失敗しました。時間をおいて再度お試しください。');
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleEdit = async (prompt?: string) => {
    const finalPrompt = prompt || editPrompt;
    if (!finalPrompt || !currentImage) return;

    try {
      setStatus(GenerationStatus.EDITING);
      setError(null);
      const result = await editHeroImage(currentImage.base64, finalPrompt);
      const newImg: GeneratedImage = {
        url: `data:image/png;base64,${result.base64}`,
        base64: result.base64,
        prompt: finalPrompt,
        timestamp: Date.now()
      };
      setCurrentImage(newImg);
      setHistory(prev => [newImg, ...prev]);
      setEditPrompt('');
      setStatus(GenerationStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('画像の編集に失敗しました。');
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold retro-title text-white mb-2 italic tracking-tighter">
          METAL HERO 1984
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Gemini 2.5 Flash Imageを活用した昭和ヒーロー生成・編集システム
        </p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1a20] rounded-xl p-6 border border-gray-800 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <i className="fas fa-robot mr-2 text-red-500"></i>
              コマンド・センター
            </h2>
            
            {!currentImage ? (
              <button
                onClick={handleInitialGeneration}
                disabled={status === GenerationStatus.GENERATING}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  status === GenerationStatus.GENERATING
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                }`}
              >
                {status === GenerationStatus.GENERATING ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    生成中...
                  </span>
                ) : (
                  'ヒーローを召喚する'
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="例: 背景を爆発させて、レトロなノイズを追加して"
                    className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500 focus:outline-none resize-none transition-all"
                    disabled={status === GenerationStatus.EDITING}
                  />
                  <button
                    onClick={() => handleEdit()}
                    disabled={status === GenerationStatus.EDITING || !editPrompt.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-red-600 text-white rounded-md hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
                  >
                    <i className={`fas ${status === GenerationStatus.EDITING ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                  </button>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">クイック・モディファイ</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_EDITS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEdit(suggestion)}
                        disabled={status === GenerationStatus.EDITING}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleInitialGeneration}
                  className="w-full py-2 bg-transparent border border-gray-700 text-gray-400 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                  最初から作り直す
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-xs">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}
          </div>

          {/* History Panel (Desktop) */}
          <div className="hidden lg:block bg-[#1a1a20] rounded-xl p-6 border border-gray-800 shadow-2xl h-[400px] overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <i className="fas fa-history mr-2 text-blue-500"></i>
              タイムライン
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
              {history.length === 0 ? (
                <p className="text-gray-600 text-sm italic text-center py-8">まだ記録はありません</p>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.timestamp}
                    onClick={() => setCurrentImage(item)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all flex gap-3 ${
                      currentImage?.timestamp === item.timestamp 
                        ? 'bg-blue-900/20 border-blue-500' 
                        : 'bg-black border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <img src={item.url} className="w-16 h-12 object-cover rounded" alt="History" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 truncate">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      <p className="text-xs text-gray-300 truncate font-medium">
                        {item.prompt === INITIAL_HERO_PROMPT ? '初期召喚' : item.prompt}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1a20] rounded-2xl border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
            <div className="aspect-[4/3] w-full bg-black flex items-center justify-center relative">
              {currentImage ? (
                <>
                  <img 
                    src={currentImage.url} 
                    alt="Generated Hero" 
                    className={`w-full h-full object-contain transition-opacity duration-700 ${
                      status === GenerationStatus.EDITING ? 'opacity-50 grayscale' : 'opacity-100'
                    }`} 
                  />
                  {(status === GenerationStatus.GENERATING || status === GenerationStatus.EDITING) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-bolt text-yellow-400 text-2xl animate-pulse"></i>
                        </div>
                      </div>
                      <p className="mt-4 text-white font-bold tracking-[0.2em] animate-pulse">SYSTEM UPDATING...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-800 border-dashed animate-pulse">
                    <i className="fas fa-mask text-4xl text-gray-700"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-500 mb-2">ヒーロー待機中</h3>
                  <p className="text-gray-600 text-sm max-w-xs mx-auto">
                    左のコントロールパネルから「ヒーローを召喚する」を押して、1984年の伝説を呼び起こしましょう。
                  </p>
                </div>
              )}
              
              {/* Scanline Effect Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]"></div>
            </div>

            {currentImage && (
              <div className="p-4 bg-black/80 border-t border-gray-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Model</span>
                  <span className="text-xs text-red-500 font-bold">GEMINI 2.5 FLASH IMAGE</span>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={currentImage.url} 
                    download={`showa_hero_${currentImage.timestamp}.png`}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center"
                  >
                    <i className="fas fa-download mr-2"></i>
                    保存
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(currentImage.prompt);
                      alert('プロンプトをコピーしました！');
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center"
                  >
                    <i className="fas fa-copy mr-2"></i>
                    プロンプト
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Instructions / Mobile info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-[#1a1a20] p-4 rounded-xl border border-gray-800">
               <h4 className="text-white font-bold mb-2 flex items-center">
                 <i className="fas fa-info-circle mr-2 text-yellow-500"></i>
                 仕様について
               </h4>
               <ul className="text-xs text-gray-400 space-y-2">
                 <li>• 1984年の「宇宙刑事」や「メタルヒーロー」シリーズをモチーフにしています。</li>
                 <li>• アスペクト比は当時のテレビサイズである4:3固定です。</li>
                 <li>• 生成された画像に対してテキストで追加の指示が可能です。</li>
               </ul>
             </div>
             <div className="bg-[#1a1a20] p-4 rounded-xl border border-gray-800">
               <h4 className="text-white font-bold mb-2 flex items-center">
                 <i className="fas fa-magic mr-2 text-purple-500"></i>
                 編集のヒント
               </h4>
               <p className="text-xs text-gray-400">
                 「腕からレーザーブレードを出して」「背景を採石場に変えて」「火花の特効を追加」など、特撮ならではの演出をリクエストしてみてください。
               </p>
             </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mt-12 py-8 border-t border-gray-800 text-center text-gray-600 text-xs">
        <p>&copy; 2024 METAL HERO PROJECT - POWERED BY GOOGLE GEMINI 2.5 FLASH IMAGE</p>
      </footer>
    </div>
  );
};

export default App;
