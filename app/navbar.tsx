'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
// @ts-ignore
import logo from './icon.jpg';
import { UserButton } from '@clerk/nextjs';


const navigation = [
  { name: 'User Dashboard', href: '/' },
  { name: 'Transactions', href: '/transactions' }
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const pathname = usePathname();
  const isOnNotAuthorizedPage = pathname.includes('not-authorized')

  return (

    <nav className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='flex h-16 justify-between'>

        { !isOnNotAuthorizedPage  ? <div className='flex'>
          <div className='flex flex-shrink-0 items-center'>
            <Image alt='PNBS' src={logo} width={50} height={50} />
          </div>
          <div className='hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8'>
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? 'border-slate-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                )}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>


        </div> : <div />

        }
        <div className='flex items-center'>
          <UserButton appearance={{

          }} afterSignOutUrl='/' />
        </div>
      </div>
    </nav>

  );
}
