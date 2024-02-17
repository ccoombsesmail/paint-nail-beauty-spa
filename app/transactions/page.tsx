'use client';
import dynamic from 'next/dynamic';

// import TransactionsTable from '../components/transactions-table/transactions-table';
import { AnimatePresence, motion } from 'framer-motion';
import { router } from 'next/client';
import LottieTransition from '../components/screen-transitions/lottie-sloth-transition';
import TransactionsTable from '../components/transactions-table/transactions-table';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/loading-screen';




function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

  }, []);

  if (isLoading) return  <LoadingSpinner />
  return (
    <main className="p-4 md:p-10 mx-auto max-w-8xl">
        <TransactionsTable />
    </main>
  );
}


export default function TransactionPageLayout() {

  return (
        <TransactionsPage />
  )
}
