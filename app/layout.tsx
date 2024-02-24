import './globals.css';


import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

// export const metadata = {
//   title: 'Paint Nail',
//   description:
//     'A dashboard for PNBS'
// };


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className="h-full bg-gray-50">
    <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `
              const style = document.createElement('style')
              style.innerHTML = '@layer tailwind-base, primereact, tailwind-utilities;'
              style.setAttribute('type', 'text/css')
              setTimeout(() => document.querySelector('head').prepend(style), 2000)
              document.querySelector('head').prepend(style.cloneNode(true))
              document.querySelector('head').prepend(style.cloneNode(true))
              document.querySelector('head').prepend(style.cloneNode(true))
              document.querySelector('head').prepend(style.cloneNode(true))
            `,
        }}

      />
      <title>Paint Nail & Beauty Spa</title>
    </head>
      <body className="h-full">
      <script
        dangerouslySetInnerHTML={{
          __html: `
              const style = document.createElement('style')
              style.innerHTML = '@layer tailwind-base, primereact, tailwind-utilities;'
              style.setAttribute('type', 'text/css')
              setTimeout(() => document.querySelector('head').prepend(style), 2000)
              document.querySelector('head').prepend(style.cloneNode(true))
              document.querySelector('head').prepend(style.cloneNode(true))
              document.querySelector('head').prepend(style.cloneNode(true))
              document.querySelector('head').prepend(style.cloneNode(true))
            `,
        }}

      />
      <ClerkProvider>
          <Suspense>
              <Nav />
          </Suspense>

            {children}
          <Analytics />



      </ClerkProvider>

      </body>
    </html>
  );
}
