import React, { useEffect, useState } from 'react';
import { useOrganization } from "@clerk/clerk-react";
import { Anchor, Table, Text } from '@mantine/core';

// List of organization pending invitations. 
// You can invite new organization members and 
// revoke already sent invitations.
const PendingInvitationsList = () => {
  const { invitations, organization } = useOrganization();
  
  const ResendInvitation = async (invitation) => {
    const emailAddress = invitation.emailAddress;
    let role = invitation.role;
    if (role == 'org:admin') {
      role = 'admin';
    }
    console.log('invitation:', invitation, emailAddress, role);
    await(invitation.revoke());
    await organization.inviteMember({emailAddress, role});
  };

  const RevokeInvitation = async (invitation) => {
    await invitation.revoke();
  };

  if (invitations.data.length === 0) {
    console.log('no invitations found');
    console.log(invitations);
    return null;
  }
  
  const pendingTableBody = invitations.data.map((invitation) => (
    <Table.Tr key={invitation.id || invitation.emailAddress}>
      <Table.Td>
        {invitation.emailAddress} (invited to be a {invitation.role == 'org:member' ? 'member' : 'admin'})
      </Table.Td>
      <Table.Td>
        <Anchor size="xs" component="button" type="button" onClick={() => ResendInvitation(invitation)}>Resend Invitation</Anchor> &nbsp;|&nbsp;
        <Anchor size="xs" component="button" type="button" onClick={() => RevokeInvitation(invitation)}>Revoke Invitation</Anchor>
      </Table.Td>
    </Table.Tr>
  ));
  
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
          {pendingTableBody}
        </Table.Tbody>
      </Table>
    </div>
  );
}

export default PendingInvitationsList;
