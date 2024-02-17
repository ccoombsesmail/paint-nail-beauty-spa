"use client"

import React, { useMemo, useState } from 'react';

import { Panel } from 'primereact/panel';
import { selectedMembershipTemplate } from '../../forms/formik/selects';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { User } from '@prisma/client';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { toast } from 'react-toastify';
export default function MembershipUpdate({ membershipOptions, user } : { membershipOptions: any[], user: User}) {
  const [option, setOption] = useState({
    name: user.membershipLevel,
    code: user.membershipLevel
  });
  const [userInfo, setUserInfo] = useState<User>(user)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const daysSinceStartDate = useMemo(() => {
    if (!userInfo.membershipStartDate) return Number.MAX_VALUE
    const now = new Date();
    const membershipStartDate = new Date(userInfo.membershipStartDate);
    const diffTime = Math.abs(now.getTime() - membershipStartDate.getTime() || 0);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [userInfo])

  const onChange = (e: any) => {
    setOption(e.value)
  }
  const allowedOptions = useMemo(() => membershipOptions.map((option: {name: string}) => {
    if (!userInfo.membershipStartDate) return option
    if (userInfo.membershipLevel === "Bronze" && option.name === "Silver") {
      return {
        ...option,
        disabled: true
      }
    }
    if ((daysSinceStartDate >= 60 && option.name === "Gold")) {
      return {
        ...option,
        disabled: true
      }
    }
    return option
  }), [daysSinceStartDate, membershipOptions, userInfo])


  const onConfirmClick = async () => {
    try {
      const res = await fetch('/api/users/membership', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userInfo.id, newMembershipLevel: option.code}),
      })
      const jsonRes = await res.json()
      console.log(res.status >= 400)
      if (res.status >= 400) {
        toast.warn(jsonRes.error)
        return
      }
      setOption({
        name: jsonRes.membershipLevel,
        code: jsonRes.membershipLevel
      })
      setUserInfo(jsonRes)
      console.log('Success:', jsonRes);
      toast.success("Successfully Updated User Membership")

    } catch (error) {
      console.error('Error:', error);
    }
    setIsSubmitting(false);
  }


  const openConfirmPopup = (event) => {
    confirmPopup({
      target: event.currentTarget,
      message: 'Are you sure you want to proceed? Membership upgrade attempts are limited',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'accept',
      className: 'max-w-64',
      accept: onConfirmClick
    });
  };


  return (

    <Panel header="Update User Membership">

      <div className='mt-4 flex w-4/6 justify-between'>
      <span className="p-float-label ">
       <Dropdown id="membership_select" valueTemplate={selectedMembershipTemplate} value={option} onChange={onChange} options={allowedOptions} optionLabel="name"
                 placeholder="Select Membership" className="w-[24rem]" />
           <label htmlFor="membership_select">Select Membership</label>
        </span>
        <ConfirmPopup />

        <Button loading={isSubmitting} disabled={isSubmitting} onClick={openConfirmPopup} label="Update Membership" />
      </div>

    </Panel>


  );
}
