// @ts-nocheck

"use client";

import { OrganizationProfile, useOrganization, useUser } from '@clerk/nextjs';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OrganizationCustomRoleKey } from '@clerk/types';
import AddEmployeeFormPage from './components/AddEmployeeFormPage';
import EditEmployeeFormPage from './components/EditEmployeeFormPage';
import { toast, Toaster } from 'sonner';
import { MembersPage } from './components/MembersPage';
import * as ReactDOM from 'react-dom/client';
import { updateOrg } from '../../client-api/organizations/organization-queries';



const queryClient = new QueryClient();

const AddIcon = () => {
  return (
   <i className='pi pi-plus'></i>
  )
}

const EnabledOrDisabledOrg = ({ updateOrgOnClick, isOrgEnabled }: { updateOrgOnClick: () => void, isOrgEnabled: boolean}) => {


  return (
    <div
      className="cl-profileSection cl-profileSection__organizationDanger 🔒️ cl-internal-1q1j6io">

      <div className="cl-profileSectionContent cl-profileSectionContent__organizationDanger 🔒️ cl-internal-1c4a89c">
        <div style={{position: 'relative'}}>
          <div className="cl-profileSectionItem cl-profileSectionItem__organizationDanger 🔒️ cl-internal-q1qgc">
            <button
              className="cl-profileSectionPrimaryButton cl-button cl-profileSectionPrimaryButton__organizationDanger cl-button__organizationDanger 🔒️ cl-internal-156ribv"
              data-localization-key="organizationProfile.profilePage.dangerSection.leaveOrganization.title"
              data-variant="ghost"
              data-color="danger"
              onClick={updateOrgOnClick}
            >
              { isOrgEnabled ? 'Disable This Organization' : 'Enable This Organization'}
            </button>
            <div className='flex  items-center'>
              <i
                style={{fontSize: '2rem', color: isOrgEnabled ? 'green' : 'red'  }}
                className={`mr-2 pi ${isOrgEnabled ? 'pi-lock-open' : 'pi-lock' } `}
              />
            { isOrgEnabled ? 'Enabled' : 'Disabled'}


            </div>

          </div>
        </div>
      </div>
      <div className="cl-profileSectionHeader cl-profileSectionHeader__organizationDanger 🔒️ cl-internal-cd7qq7">
        <div className="cl-profileSectionTitle cl-profileSectionTitle__organizationDanger 🔒️ cl-internal-1aock5z">
          <p className="cl-profileSectionTitleText cl-profileSectionTitleText__organizationDanger 🔒️ cl-internal-1y71s3o" data-localization-key="organizationProfile.profilePage.dangerSection.leaveOrganization.title">
             Organization Status
          </p>
        </div>
      </div>

    </div>
  )
}

const UsersIcon = () => {
  return (
    <i className='pi pi-users'></i>
  )
}

const OrganizationProfilePage = () => {
  const path = usePathname();
  const [isOrgEnabled, setIsOrgEnabled] = useState(null)

  const { organization } = useOrganization()
  const renderCount = useRef(0)
  const { user } = useUser()

  const { is_admin } = user ? user.publicMetadata : { is_admin: false}
  const { is_org_enabled } =  organization?.publicMetadata || {}
  useEffect(() => {
    if (is_org_enabled !== undefined) setIsOrgEnabled(is_org_enabled)
  }, [is_org_enabled]);


  const updateOrgOnClick = useCallback(async () => {
    toast.promise(updateOrg({ shouldDisable: !is_org_enabled }), {
      loading: 'Modifying Organization Status',
      success: (data) => {
        return `Successfully Changed Organization Status To ${data.isOrgEnabled ? 'Enabled' : 'Disabled'}`;
      },
      onAutoClose: () => window.location.reload(),
      duration: 1500

    });


  }, [is_org_enabled]);

  useEffect(() => {
    if (isOrgEnabled !== null && path.includes('organization-general') && renderCount.current < 1 && is_admin) {
      renderCount.current += 1
      setTimeout(() => {
        const container = document.createElement('div');
        // document.body.appendChild(container);
        const root = ReactDOM.createRoot(container);
        root.render(<EnabledOrDisabledOrg updateOrgOnClick={updateOrgOnClick} isOrgEnabled={isOrgEnabled} />);

        document.getElementsByClassName('cl-profilePage__organizationGeneral')[0].append(container)

      }, 500)
    }
  }, [path, is_admin, isOrgEnabled, updateOrgOnClick]);



  return (
    <QueryClientProvider client={queryClient} >
      <Toaster richColors position='top-right' />
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
            <AddEmployeeFormPage />
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
