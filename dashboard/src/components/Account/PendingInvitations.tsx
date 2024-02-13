import React, { useEffect, useState } from 'react';
import classes from './css/InviteUser.module.css';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';

const PendingInvitationsList = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { invitations, organization } = useOrganization({ invitations: true });
  const [ invitationData, setInvitationData ] = useState([]);
  const [ emailAddress, setEmailAddress ] = useState('');
  const [ isValidEmail, setIsValidEmail ] = useState(false);
  const [ role, setRole ] = useState('org:member');
  const [ disabled, setDisabled ] = useState(false);
  const [ mustRerender, setMustRerender ] = useState(false);

  if (!isLoaded || !isSignedIn || !invitations) {
    return null;
  }

  useEffect(() => {
    console.log(`clerk organization: ${organization.inviteMember}`);
    if (invitations && invitations.data) {
      setTimeout( () => {
        //console.log(`Re-ingesting invitation data in useEffect, invitations=${JSON.stringify(invitations,null,2)}`);
        setInvitationData(invitations.data);
      }, 5000);
//      setMustRerender(false);
    }
  }, [invitations]);

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
    console.log(`sendInvitation, organization:${JSON.stringify(organization, null, 2)}, organization.inviteMember: $`);
    await organization.inviteMember({ emailAddress, role });
    setEmailAddress('');
    setRole(role);
    setDisabled(false);
//    setMustRerender(true);
  };

  const ResendInvitation = async (invitation) => {
    const emailAddress = invitation.emailAddress;
    let role = invitation.role;
    if (role == 'org:admin') {
      role = 'admin';
    }
    console.log('invitation:', invitation, emailAddress, role);
//    await(invitation.revoke());
    await organization.inviteMember({emailAddress, role});
//    setMustRerender(true);
    console.log('Resending invitation at index:', invitationIndex);
  };

  const RevokeInvitation = async (invitation) => {
    const emailAddress = invitation.emailAddress;
    let role = invitation.role;
    if (role == 'org:admin') {
      role = 'admin';
    }
    console.log('invitation:', invitation, emailAddress, role);
    await(invitation.revoke());
//    await organization.inviteMember({emailAddress, role});
//    setMustRerender(true);

  };

  return (
    <div style={{marginTop:'30px'}}>
      <Text size="lg">Pending Teammate Invitations</Text>
      <Table verticalSpacing="xs" highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Email</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {invitationData.map((invitation, index) => (
            <Table.Tr key={invitation.id || invitation.emailAddress}>
              <Table.Td>
                {invitation.emailAddress} (invited to be a {invitation.role === 'org:member' ? 'member' : 'admin'})
              </Table.Td>
              <Table.Td>
                <Anchor size="xs" component="button" type="button" onClick={() => ResendInvitation(invitation)}>Resend Invitation</Anchor> &nbsp;|&nbsp;
                <Anchor size="xs" component="button" type="button" onClick={() => RevokeInvitation(invitation)}>Revoke Invitation</Anchor>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

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


    </div>
  );
};

export default PendingInvitationsList;




/*

import React, { useEffect, useState } from 'react';
import { useUser, useOrganization, useOrganizationList } from "@clerk/clerk-react" 
import { Anchor, Table, Text } from '@mantine/core';

// List of organization pending invitations. 
// You can invite new organization members and 
// revoke already sent invitations.
const PendingInvitationsList = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { invitations, organization } = useOrganization({
    invitations: true
  });
  const [ pendingInvitesTable, setPendingInvitesTable ] = useState('');
  const [ mustRerender, setMustRerender ] = useState(false);
  
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const ResendInvitation = async (invitation) => {
    const emailAddress = invitation.emailAddress;
    let role = invitation.role;
    if (role == 'org:admin') {
      role = 'admin';
    }
    console.log('invitation:', invitation, emailAddress, role);
    await(invitation.revoke());
    await organization.inviteMember({emailAddress, role});
    setMustRerender(true);
  };

  const RevokeInvitation = async (invitation) => {
    await invitation.revoke();
    setMustRerender(true);
  };

  //  console.log('got invitations:', invitations);
  if (invitations === null) {
    console.log('no invitations found');
    return null;
  } else {
    if (invitations.data.length === 0) {
      console.log('inv array present but empty');
      console.log(invitations);
      return null;
    }
  }

  const renderPendingInvites = () => {
    setPendingInvitesTable(invitations.data.map((invitation) => (
      <Table.Tr key={invitation.id || invitation.emailAddress}>
        <Table.Td>
          {invitation.emailAddress} (invited to be a {invitation.role == 'org:member' ? 'member' : 'admin'})
        </Table.Td>
        <Table.Td>
          <Anchor size="xs" component="button" type="button" onClick={() => ResendInvitation(invitation)}>Resend Invitation</Anchor> &nbsp;|&nbsp;
          <Anchor size="xs" component="button" type="button" onClick={() => RevokeInvitation(invitation)}>Revoke Invitation</Anchor>
        </Table.Td>
      </Table.Tr>
    )));
    console.log('Did rerender');
  };
  
  useEffect( () => {
    renderPendingInvites();
  }, []);
  
  useEffect( () => {
    renderPendingInvites();
    setMustRerender(false);
  }, [mustRerender]);

  return (
    <div style={{marginTop:'30px'}}>
      <Text size="lg">Pending Teammate invitations</Text>
      <Table verticalSpacing="xs" highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Email</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pendingInvitesTable}
        </Table.Tbody>
      </Table>
    </div>
  );
}

export default PendingInvitationsList;
*/
