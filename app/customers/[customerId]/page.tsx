"use client"

import CustomerProfilePage from '../../components/customer-page';
import { QueryClient, QueryClientProvider } from 'react-query';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from 'primereact/sidebar';

const queryClient = new QueryClient();


export default function CustomerPage({ params } : { params: { customerId: string }}) {

  const [masterCode, setMasterCode] = useState('')
  const [isSideVisible, setIsSideVisible] = useState(false);
  const [timer, setTimer] = useState(600);

  useEffect(() => {
    const unlock = masterCode === 'pnbs'
    setIsSideVisible(unlock)
  }, [masterCode]);

  useEffect(() => {
    let interval: any;
    if (isSideVisible && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      // Clear masterCode and hide sidebar
      setMasterCode('');
      setIsSideVisible(false);
      setTimer(15); // Reset timer for next visibility
    }
    return () => clearInterval(interval); // Cleanup interval on component unmount or sidebar hide
  }, [isSideVisible, timer]);

  const unlock = masterCode === 'pnbs'

  const header = useMemo(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return (
      <div className='w-full flex flex-col justify-center items-center'>
        <div className='w-full flex justify-center items-center'>
          <i className='pi pi-exclamation-triangle' style={{ fontSize: '3rem' }} />
          <h2 className='text-3xl text-red-500'>Caution You Are In Unlocked Mode!</h2>
          <i className='pi pi-exclamation-triangle' style={{ fontSize: '3rem' }} />
        </div>
        <p className='text-red-500'>
          Only make changes in Unlocked Mode if absolutely necessary. It could cause major problems if not used
          carefully.
          Consider asking for assistance first
        </p>
        <div className='text-lg text-gray-500 my-4'>Unlocked Mode Will Automatically Exit In: {formattedTime}</div>

      </div>
    )
  }, [timer])

  return (
    <>
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <QueryClientProvider client={queryClient}>
          <Sidebar dismissable={false} modal={false} header={header} className='h-[140px]' visible={isSideVisible} position="top" onHide={() => setIsSideVisible(false)} />


          <div className="p-inputgroup flex-1 w-[10rem] fixed bottom-3 right-[60px]">
            <span className="p-inputgroup-addon">
              <i className={unlock ? 'pi pi-lock-open' : 'pi pi-lock' }></i>
            </span>
            <InputText value={masterCode} className='w-[10rem]' placeholder='Master Code' onChange={e => setMasterCode(e.target.value)} />
          </div>

          <CustomerProfilePage unlock={unlock} masterCode={masterCode} />
        </QueryClientProvider>
      </main>
    </>

  );
}
