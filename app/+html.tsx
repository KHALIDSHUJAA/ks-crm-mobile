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

        <ScrollViewStyleReset />

        <link rel="manifest" href="/manifest.json" />
        <style id="expo-vector-icons">{`
          @font-face {
            font-family: 'Ionicons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
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
