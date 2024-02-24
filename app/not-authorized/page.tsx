'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/loading-screen';




function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)

  }, []);

  if (isLoading) return  <LoadingSpinner />
  return (
    <main className="p-4 md:p-10 mx-auto max-w-8xl">
      <h1 className='text-6xl'>
        Not Authorized
      </h1>
    </main>
  );
}


export default function TransactionPageLayout() {

  return (
    <TransactionsPage />
  )
}
