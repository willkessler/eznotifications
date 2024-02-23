import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './css/InviteUser.module.css';
import InviteMember from './InviteMember';
import MembersManager from './MembersManager';
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
      <MembersManager />
      <InvitationsManager />
    </div>
  );
}

export default ManageTeam;
