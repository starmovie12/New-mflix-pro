"use client";

import Script from "next/script";

export function MonetagScripts() {
  return (
    <>
      <Script
        id="monetag-al5sm"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var s = document.createElement('script');
              s.dataset.zone = '10510766';
              s.src = 'https://al5sm.com/tag.min.js';
              (document.documentElement || document.body).appendChild(s);
            })();
          `,
        }}
      />
      <Script
        id="monetag-vignette"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var s = document.createElement('script');
              s.dataset.zone = '10511469';
              s.src = 'https://gizokraijaw.net/vignette.min.js';
              (document.documentElement || document.body).appendChild(s);
            })();
          `,
        }}
      />
    </>
  );
}
