import React, { useEffect, useState } from 'react';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';

// List of organization pending invitations. 
// You can invite new organization members and 
// revoke already sent invitations.
const PendingInvitationsList = () => {
  const { invitationList, organization } = useOrganization({
    invitationList: {}
  });
 
  const ResendInvitation = async (inv) => {
    const emailAddress = inv.emailAddress;
    let role = inv.role;
    if (role == 'org:admin') {
      role = 'admin';
    }
    console.log('inv:', inv, emailAddress, role);
    await(inv.revoke());
    await organization.inviteMember({emailAddress, role});
  };

  const RevokeInvitation = async (inv) => {
    await inv.revoke();
  };

  if (!invitationList) {
    console.log('no invitations found');
    return null;
  }
  
  const pendingTableBody = invitationList.map((i) => (
    <Table.Tr>
      <Table.Td>
      {i.emailAddress}
      </Table.Td>
      <Table.Td>
        <Anchor size="xs" component="button" type="button" onClick={() => ResendInvitation(i)}>Resend</Anchor> &nbsp;|&nbsp;
        <Anchor size="xs" component="button" type="button" onClick={() => RevokeInvitation(i)}>Revoke</Anchor>
      </Table.Td>
    </Table.Tr>
  ));
  
  return (
    <div style={{marginTop:'30px'}}>
      <Text size="md">Pending Teammate invitations</Text>
      <Table verticalSpacing="xs" striped highlightOnHover withColumnBorders withTableBorder>
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

