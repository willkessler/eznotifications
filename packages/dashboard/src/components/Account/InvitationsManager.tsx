import React, { useEffect, useState } from 'react';
import classes from './css/InviteUser.module.css';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { OrganizationInvitationResource } from "@clerk/types";
import { Anchor, Button, Group, Paper, Radio, Stack, TextInput, Textarea, Text } from '@mantine/core';

const InvitationsManager = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { invitations, organization } = useOrganization({ invitations: true });
  const [ invitationData, setInvitationData ] = useState([]);
  const [ emailAddress, setEmailAddress ] = useState('');
  const [ isValidEmail, setIsValidEmail ] = useState(false);
  const [ role, setRole ] = useState('org:member');
  const [ disabled, setDisabled ] = useState(false);
  const [ sendLabel, setSendLabel ] = useState('Send invitation');

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  useEffect(() => {
    //console.log(`clerk organization: ${organization.inviteMember}`);
      setSendLabel('Send invitation');
      setDisabled(false);
  }, [invitations]);

  const validateEmail = (email:string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  // Handle email input changes
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const emailInput = event.target.value;
    setEmailAddress(emailInput);
    setIsValidEmail(validateEmail(emailInput));
  };

  const sendInvitation = async () => {
    setDisabled(true);
    console.log(`sendInvitation, organization:${JSON.stringify(organization, null, 2)}, organization.inviteMember: $`);
    setDisabled(true);
    setSendLabel('...working...');
    try {
      await organization?.inviteMember({ emailAddress, role });
    } catch (error) {
      console.log(`Cannot send invitation to ${emailAddress}, they are already invited.`);
    }
    await invitations?.revalidate?.();
    setEmailAddress('');
    setRole(role);
  };

    const ResendInvitation = async (invitation: OrganizationInvitationResource) => {
        const emailAddress = invitation.emailAddress;
        let role = invitation.role;
        if (role == 'org:admin') {
            role = 'admin';
        }
        console.log('invitation:', invitation, emailAddress, role);
        await invitation.revoke();
        await organization?.inviteMember({emailAddress, role});
        await invitations?.revalidate?.();
        console.log(`Resent invitation : ${invitation}.`);
    };

    const RevokeInvitation = async (invitation: OrganizationInvitationResource) => {
        const emailAddress = invitation.emailAddress;
        let role = invitation.role;
        if (role == 'org:admin') {
            role = 'admin';
        }
        console.log('invitation:', invitation, emailAddress, role);
        await invitation.revoke();
        await invitations?.revalidate?.();
        console.log(`Revoked invitation : ${invitation}.`);
    };

  return (
    <div style={{marginTop:'30px'}}>
      <Text size="lg">Pending Teammate Invitations</Text>
      {invitations?.data?.map((invitation) => (
        <Paper style={{paddingTop:'10px',marginTop:'10px'}}
               key={invitation.id} 
               radius="md" 
               withBorder 
               p="sm">
          <Group align="center" justify="flex-start" gap="xs">
            <Text>{invitation.emailAddress}</Text>
            <Text size="xs">(invited to be a {invitation.role === 'org:member' ? 'member' : 'admin'})</Text>
            <Anchor size="xs" component="button" type="button" onClick={() => ResendInvitation(invitation)}>Resend Invitation</Anchor>
            <Anchor size="xs" component="button" type="button" onClick={() => RevokeInvitation(invitation)}>Revoke Invitation</Anchor>
              </Group>
        </Paper>
      ))}
      <form onSubmit={sendInvitation}>
        <Group justify="flex-start" p="sm" gap="xs">
          <Text size="md">Add teammates:</Text>
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
          <Button size="xs" type="submit" disabled={disabled || !isValidEmail}>
            {sendLabel}
          </Button>
        </Group>
      </form>


    </div>
  );
};

export default InvitationsManager;
