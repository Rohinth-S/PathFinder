import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <style dangerouslySetInnerHTML={{ __html: responsiveWebResetStyles }} />
      </head>
      <body>
        {children}
        {/* Required for Clerk Bot Protection on Web */}
        <div id="clerk-captcha"></div>
      </body>
    </html>
  );
}

const responsiveWebResetStyles = `
  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  body {
    overflow-y: auto;
    font-family: sans-serif;
  }
`;