import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './css/InviteUser.module.css';
import InviteMember from './InviteMember';
import MemberList from './MemberList';
import InvitationsManager from './InvitationsManager';
 
const ManageTeam = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { invitations, organization } = useOrganization({ invitations: {} });
  const [invitationData, setInvitationData] = useState([]);
 
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div style={{marginTop:'30px'}}>
      <Text size="lg">Active Teammates</Text>
      {!invitations && (
        <Text size="xs">(You haven't invited any teammates yet. Invite one below.)</Text>
      )}
      <MemberList />
      <InvitationsManager />
    </div>
  );
}

export default ManageTeam;
