import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface GraphCommentWidgetProps {
  uid?: string;
}

export const GraphCommentWidget: React.FC<GraphCommentWidgetProps> = ({ uid }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Set parameters for GraphComment
    (window as any).__semio__params = {
      graphcommentId: "WATTYBOON",
      behaviour: {
        uid: uid || undefined,
      },
    };

    (window as any).__semio__onload = function () {
      if (typeof (window as any).__semio__gc_graphlogin === 'function') {
        (window as any).__semio__gc_graphlogin((window as any).__semio__params);
      }
      setIsLoading(false);
    };

    const container = document.getElementById('graphcomment');
    if (container) {
      container.innerHTML = ''; // Reset container when uid changes
    }

    const scriptId = 'graphcomment-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
      script.src = 'https://integration.graphcomment.com/gc_graphlogin.js?' + Date.now();
      script.onload = () => {
        if (typeof (window as any).__semio__onload === 'function') {
          (window as any).__semio__onload();
        }
        setIsLoading(false);
      };
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    } else {
      if (typeof (window as any).__semio__gc_graphlogin === 'function') {
        (window as any).__semio__gc_graphlogin((window as any).__semio__params);
      }
      setIsLoading(false);
    }
  }, [uid]);

  return (
    <div className="w-full my-4 bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm transition-all">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Topluluk Yorumları</h4>
            <p className="text-[11px] text-slate-400">GraphComment ile güvenli ve anlık tartışma alanı</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] tracking-wide">
          CANLI
        </span>
      </div>

      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
          <span>Yorumlar yükleniyor...</span>
        </div>
      )}

      <div id="graphcomment" className="min-h-[180px]"></div>
    </div>
  );
};
