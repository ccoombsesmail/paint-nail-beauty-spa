'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/loading-screen';




function OrganizationDisabled() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)

  }, []);

  if (isLoading) return  <LoadingSpinner />
  return (
    <main className="p-4 md:p-10 mx-auto max-w-8xl flex flex-col items-center justify-center">
      <h2 className='text-3xl'>
        You Are Not Authorized To Access This Portal
      </h2>
      <h2  className='text-1xl'>
        Please Contact The Admin To Request Access
      </h2>
      <h3>
        Email: zztc2004@gmail.com or jayzhang@paintnailbeautyspa.net
      </h3>
    </main>
  );
}


export default function OrganizationDisabledLayout() {

  return (
    <OrganizationDisabled />
  )
}
