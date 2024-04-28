// @ts-nocheck

"use client";

import { OrganizationProfile, useOrganization } from '@clerk/nextjs';
import { memo, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OrganizationCustomRoleKey } from '@clerk/types';
import AddEmployeeFormPage from './components/AddEmployeeFormPage';
import EditEmployeeFormPage from './components/EditEmployeeFormPage';
import { toast } from 'sonner';
import { MembersPage } from './components/MembersPage';



const queryClient = new QueryClient();

const AddIcon = () => {
  return (
   <i className='pi pi-plus'></i>
  )
}

const PencilIcon = () => {
  return (
    <i className='pi pi-pencil'></i>
  )
}

const UsersIcon = () => {
  return (
    <i className='pi pi-users'></i>
  )
}

const OrganizationProfilePage = () => {
  const path = usePathname();
  const { organization } = useOrganization()
  const [fetchedRoles, setRoles] = useState<OrganizationCustomRoleKey[]>([])
  const isPopulated = useRef(false)

  useEffect(() => {
    if (isPopulated.current) return
    organization
      ?.getRoles({
        pageSize: 10,
        initialPage: 1,
      })
      .then((res) => {
        isPopulated.current = true
        setRoles(
          res.data
            .map((roles) => roles.key as OrganizationCustomRoleKey)
            .map((role: string) => ({name: role.split(':')[1], code: role }))
        )
      })
  }, [organization?.id])

  useEffect(() => {
    const interval = setInterval(() => {
      const list = document.querySelector('.cl-navbarButtons');
      if (list) {
        const elements = {};
        Array.from(list.children).forEach(child => {

          if (child.textContent.includes("Settings")) elements.settings = child;
          if (child.textContent.includes("Members")) elements.members = child;
          if (child.textContent.includes("Employees")) elements.employees = child;
        });

        // Check if all elements are found
        if (elements.members && elements.employees && elements.settings) {
          // Clear the existing content of the list
          while (list.firstChild) {
            list.removeChild(list.firstChild);
          }

          // Append elements in the specific order: Members, Employees, Settings
          list.appendChild(elements.members);
          list.appendChild(elements.employees);
          list.appendChild(elements.settings);

          clearInterval(interval);
        }
      }
    }, 100);
  }, []);

    useEffect(() => {
      if (path === '/organization-profile') {
        const inter = setInterval(() => {
          const tabContainer = document.querySelector('.cl-tabListContainer')
          const inviteBtn = document.querySelector('.cl-membersPageInviteButton')
          if (tabContainer && inviteBtn) {
            const secondTab = tabContainer.children[1];
            secondTab.classList.add('hide');
            inviteBtn.classList.add('hide')
            clearInterval(inter)
          }

        }, 100)
      }

      }, [path]);

  return (
    <QueryClientProvider client={queryClient} >
      <div className='flex w-full justify-center mt-10'>

        <OrganizationProfile path='/organization-profile' routing='path' >
          <OrganizationProfile.Page
            label='Members'
            url='employees'
            labelIcon={<UsersIcon />}
          >
            <MembersPage />
          </OrganizationProfile.Page>
          <OrganizationProfile.Page
            label='Add Employees'
            url='add-employees'
            labelIcon={<AddIcon />}
          >
            <AddEmployeeFormPage fetchedRoles={fetchedRoles} />
          </OrganizationProfile.Page>
          {/*<OrganizationProfile.Page*/}
          {/*  label='Edit Employees'*/}
          {/*  url='edit-employees'*/}
          {/*  labelIcon={<PencilIcon />}*/}
          {/*>*/}
          {/*  <EditEmployeeFormPage fetchedRoles={fetchedRoles} />*/}
          {/*</OrganizationProfile.Page>*/}
          <OrganizationProfile.Page label='general'   />
          <OrganizationProfile.Page label="members"  />

        </OrganizationProfile>

      </div>
    </QueryClientProvider>
  );
}

export default memo(OrganizationProfilePage);
