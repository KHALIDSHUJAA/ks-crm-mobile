import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function HTML({ children }: PropsWithChildren) {
  return (
    <html lang="ar">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="نظام إدارة العملاء" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="apple-touch-icon" href="/icon.png" />
        <ScrollViewStyleReset />

        <link rel="manifest" href="/manifest.json" />
        <style id="expo-status-bar-fix">{`
          html, body {
            background-color: #0a0a0a !important;
          }
        `}</style>
        <style id="expo-vector-icons">{`
          @font-face {
            font-family: 'Ionicons';
            src: url('/fonts/Ionicons.ttf') format('truetype');
          }
          .icon-icon {
            font-family: 'Ionicons';
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
