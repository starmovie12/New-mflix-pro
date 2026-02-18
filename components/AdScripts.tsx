"use client";

import Script from "next/script";

export function AdScripts() {
  return (
    <>
      <Script
        id="monetag-al5sm"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10510766';s.src='https://al5sm.com/tag.min.js'})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />
      <Script
        id="monetag-vignette"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `(function(s){s.dataset.zone='10511469';s.src='https://gizokraijaw.net/vignette.min.js'})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />
    </>
  );
}
