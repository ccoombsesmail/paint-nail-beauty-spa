import './globals.css';
import "primereact/resources/themes/lara-light-pink/theme.css";
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css';
import 'react-toastify/dist/ReactToastify.css';

import { Analytics } from '@vercel/analytics/react';
import Nav from './nav';
import { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Paint Nail',
  description:
    'A dashboard for PNBS'
};


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
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
