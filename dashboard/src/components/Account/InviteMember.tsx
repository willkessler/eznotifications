import React, { useEffect, useState } from 'react';
import classes from './css/InviteUser.module.css';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';

const InviteMember = () => {
  const { organization, membership, isLoaded, invitationList } = useOrganization();
  const [emailAddress, setEmailAddress] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [role, setRole] = useState('org:member');
  const [disabled, setDisabled] = useState(false);
 
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  // Handle email input changes
  const handleEmailChange = (event) => {
    const emailInput = event.target.value;
    setEmailAddress(emailInput);
    setIsValidEmail(validateEmail(emailInput));
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    setDisabled(true);
    await organization.inviteMember({ emailAddress, role });
    setEmailAddress('');
    setRole(role);
    setDisabled(false);
  };
   
  return (
    <form onSubmit={sendInvitation}>
      <div className={classes.invitationControls}>
        <Text size="sm" style={{marginRight:'10px'}}>Add teammates:</Text>
        <TextInput
          size="xs"
          placeholder="teammate@example.com"
          value={emailAddress}
          onChange={handleEmailChange}
          required
        />
        <Radio.Group
          name="Role"
          withAsterisk
          value={role}
          onChange={setRole}
          size="xs"
          className={classes.invitationControlsGroup}
        >
          <Group>
            <Radio value="org:member" label="Member" size="xs" iconColor="dark.8" color="lime.4" />
            <Radio value="org:admin" label="Admin" iconColor="dark.8" color="lime.4"  />
          </Group>
        </Radio.Group>
        <Button size="xs" type="submit" disabled={!isValidEmail} style={{marginLeft:'10px'}}>
          Send Invitation
        </Button>
      </div>
    </form>
  );
}

export default InviteMember;
