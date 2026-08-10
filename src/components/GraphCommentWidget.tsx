import React, { useEffect } from 'react';

interface GraphCommentWidgetProps {
  uid?: string;
}

export const GraphCommentWidget: React.FC<GraphCommentWidgetProps> = ({ uid }) => {
  useEffect(() => {
    // Set parameters
    (window as any).__semio__params = {
      graphcommentId: "WATTYBOON", // site shortname
      behaviour: {
        uid: uid || undefined,
      },
    };

    (window as any).__semio__onload = function () {
      if (typeof (window as any).__semio__gc_graphlogin === 'function') {
        (window as any).__semio__gc_graphlogin((window as any).__semio__params);
      }
    };

    // Inject script
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
      };
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    } else {
      if (typeof (window as any).__semio__gc_graphlogin === 'function') {
        (window as any).__semio__gc_graphlogin((window as any).__semio__params);
      }
    }
  }, [uid]);

  return (
    <div className="w-full my-6 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div id="graphcomment"></div>
    </div>
  );
};
