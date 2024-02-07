import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './css/InviteUser.module.css';
import InviteMember from './InviteMember';
import MemberList from './MemberList';
import PendingInvitationsList from './PendingInvitations';
 
const ManageTeam = () => {
  const { invitationList, organization } = useOrganization({ invitationList: {} });
 
  if (!invitationList) {
    return null;
  }
 
  return (
    <div style={{marginTop:'30px'}}>
      <Text size="lg">Active Teammates</Text>
      <MemberList />
      <PendingInvitationsList />
      <InviteMember />
    </div>
  );
}

export default ManageTeam;
