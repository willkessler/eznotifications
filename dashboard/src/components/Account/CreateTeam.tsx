import React, { useEffect, useState } from 'react';
import { Anchor, Button, Table, TextInput, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './css/InviteUser.module.css';
import InviteMember from './InviteMember';
import PendingInvitationsList from './PendingInvitations';

const CreateTeam = () => {
  return (
    <div className={classes.firstTimeTeamSetup}>
      <Text>In order to invite additional team members, first you must create a team.</Text>
      <Button>Create your team</Button>
    </div>
  )
}

export default CreateTeam;
