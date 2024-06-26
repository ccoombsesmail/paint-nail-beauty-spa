'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
// @ts-ignore
import logo from './icon.jpg';
import { OrganizationList, OrganizationSwitcher, useOrganization, UserButton, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';




function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const pathname = usePathname();
  const isOnNotAuthorizedPage = pathname.includes('not-authorized')
  const isOnOrgDisabledPage =   pathname.includes('organization-disabled')
  const {isLoaded, organization } = useOrganization()

  const navigation = organization ? [
    { name: 'User Dashboard', href: '/' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Manage Organization', href: '/organization-profile' }] :
    [
      { name: 'User Dashboard', href: '/' },
      { name: 'Transactions', href: '/transactions' },

  ];

  useEffect(() => {

    const addClick = () => {
      const trigger = document.querySelector('.cl-organizationSwitcherTrigger')
      if (trigger) {

        document.querySelector('.cl-organizationSwitcherTrigger')?.addEventListener("click", () => {
          console.log("here")
          setTimeout(() => {
            const parentElement = document.querySelector('.cl-organizationSwitcherPopoverActions');
            if (parentElement) {
              parentElement.querySelector(".cl-userPreview__personalWorkspace")?.parentElement.remove()
            }
          }, 100)

        })
        return true
      }
      return false
    };

    // Set an interval to check for the element and delete it
    const checkIntervalId = setInterval(() => {
      if (addClick()) {
        clearInterval(checkIntervalId); // Clear the interval once the element is found and deleted
      }
    }, 1000);

    // Clean up the intervals on component unmount
    return () => {
      clearInterval(checkIntervalId);
    };
  }, []);

  if (!isLoaded) return null

  return (

    <nav className='mx-auto  px-4 sm:px-6 lg:px-8'>
      {/*<div className='absolute h-[4rem] flex items-center left-1 top-[2rem] translate-y-[-50%]'>*/}
      {/*  <OrganizationSwitcher />*/}
      {/*</div>*/}
      <div className='flex h-16 justify-between'>
        <div className='flex items-center'>
          { (!isOnNotAuthorizedPage && !isOnOrgDisabledPage) && <OrganizationSwitcher organizationProfileMode='navigation' organizationProfileUrl='/organization-profile' /> }


        { (!isOnNotAuthorizedPage && !isOnOrgDisabledPage)  ? <div className='flex ml-14'>
          <div className='flex flex-shrink-0 items-center'>
            <Image alt='PNBS' src={logo} width={50} height={50} />
          </div>
          <div className='hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8'>
            {navigation.map((item) => {
              let shouldFocus

              if (item.href === '/') {
                shouldFocus = pathname === "/"
              } else if (pathname.replaceAll('/', '').includes(item.href.replaceAll("/", ""))) {
                shouldFocus = true
              }
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    shouldFocus
                      ? 'border-slate-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  )}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </a>
              );
            })}
          </div>


        </div> : <div />

        }
        </div>
        <div className='flex items-center'>
          <UserButton appearance={{

          }} afterSignOutUrl='/' />
        </div>
      </div>
    </nav>

  );
}
