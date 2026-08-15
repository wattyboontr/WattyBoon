import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, X, Check, FileText, UserPlus, BookOpen } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onInsertText: (text: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  onInsertText,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [type, setType] = useState<'continue' | 'enhance' | 'character' | 'outline'>('continue');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult('');

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type,
          context: currentContent.slice(-1500), // pass last 1500 characters context
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Yapay zeka yanıtı alınamadı.');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold">WattyBoon AI Yazım Asistanı</h3>
              <p className="text-[11px] text-purple-200">Gemini 2.5 Flash ile desteklenen edebi yaratıcılık motoru</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-100 text-xs">
          
          {/* Action Selector */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-bold mb-2">Ne Tür Bir Destek İstiyorsunuz?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('continue')}
                className={`p-3 rounded-xl border text-left font-bold flex flex-col gap-1 transition-all ${
                  type === 'continue'
                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300'
                }`}
              >
                <Wand2 className="w-4 h-4 text-purple-500" />
                <span>Devam Ettir</span>
              </button>

              <button
                type="button"
                onClick={() => setType('enhance')}
                className={`p-3 rounded-xl border text-left font-bold flex flex-col gap-1 transition-all ${
                  type === 'enhance'
                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Edebi Dili Zenginleştir</span>
              </button>

              <button
                type="button"
                onClick={() => setType('character')}
                className={`p-3 rounded-xl border text-left font-bold flex flex-col gap-1 transition-all ${
                  type === 'character'
                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>Karakter Üret</span>
              </button>

              <button
                type="button"
                onClick={() => setType('outline')}
                className={`p-3 rounded-xl border text-left font-bold flex flex-col gap-1 transition-all ${
                  type === 'outline'
                    ? 'bg-purple-50 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300'
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Bölüm Taslağı</span>
              </button>
            </div>
          </div>

          {/* Additional prompt input */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5">
              Özel Talimat (Opsiyonel)
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örn: Yağmurlu bir gecede sürpriz bir karşılaşma ile sahneyi aç..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Yapay Zeka Düşünüyor...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" /> Yanıt Oluştur
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Generated Result Output */}
          {result && (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-600 dark:text-purple-400">Üretilen İçerik:</span>
                <button
                  type="button"
                  onClick={() => {
                    onInsertText(result);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Metne Ekle
                </button>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto font-serif">
                {result}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
