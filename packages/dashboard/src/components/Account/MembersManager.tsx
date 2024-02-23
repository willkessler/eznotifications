import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Paper, Stack, Table, TextInput, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './css/InviteUser.module.css';
import InviteMember from './InviteMember';
import PendingInvitationsList from './PendingInvitations';
import { useMediaQuery } from '@mantine/hooks';
 
const AdminControls = ({ membership }: { membership: OrganizationMembershipResource }) => {
  const [disabled, setDisabled] = useState(false);

  const {
    user: { id: userId },
  } = useUser();
  const { memberships } = useOrganization({
    memberships: {
      infinite: true,
      keepPreviousData: true,
    }
  });
 
  if (membership.publicUserData.userId === userId) {
    return null;
  }
 
  const removeMember = async () => {
    setDisabled(true);
    await membership.destroy();
    await memberships?.revalidate?.();
  };
 
  const changeRole = async (role: MembershipRole) => {
    setDisabled(true);
    await membership.update({ role });
    await memberships?.revalidate?.();
    setDisabled(false);
  };
 
  return (
    <>
      <Anchor size="xs" component="button" style={{marginRight:'10px', paddingRight: '10px'}} onClick={removeMember}>
        Remove member
      </Anchor>
      {membership.role === "admin" ? (
        <Anchor size="xs" component="button" onClick={() => changeRole("org:member")}>
          Make regular member
        </Anchor>
      ) : (
        <Anchor size="xs" component="button" onClick={() => changeRole("org:admin")}>
          Make admin
        </Anchor>
      )}
    </>
  );
};

const MembersManager = () => {
  // If on a small screen use cards for the members and invites, not a table
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { membership, memberships } = useOrganization({
    memberships: {
      infinite: true,
      keepPreviousData: true,
    }
  });
  //console.log('memberships:', memberships);

  if (!memberships) {
    return null;
  }
 
  const isCurrentUserAdmin = membership.role === "org:admin";
 
  if (isSmallScreen) {
    const memberCards = memberships.data.map((m) => (
        <Paper style={{paddingTop:'10px',marginTop:'10px'}} 
               radius="md" key={m.publicUserData.identifier} withBorder p="sm">
          <Stack align="flex-start" justify="flex-start" gap="xs">
            <Text>{m.publicUserData.firstName} {m.publicUserData.lastName}</Text>
            <Text>{m.publicUserData.identifier}</Text>
            <Text size="xs">{(m.role === 'org:admin') ? 'Admin' : 'Member'}</Text>
            {isCurrentUserAdmin && <AdminControls membership={m} />}
          </Stack>
        </Paper>
    ));
    return memberCards;
  } else {
    const memberRows = memberships.data.map((m) => (
      <Table.Tr key={m.publicUserData.identifier}>
        <Table.Td>{m.publicUserData.firstName} {m.publicUserData.lastName}</Table.Td>
        <Table.Td>{m.publicUserData.identifier}</Table.Td>
        <Table.Td>{(m.role === 'org:admin') ? 'Admin' : 'Member'}</Table.Td>
        <Table.Td>{isCurrentUserAdmin && <AdminControls membership={m} />}</Table.Td>
      </Table.Tr>
    ));

    return (
      <Table verticalSpacing="xs" highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Status</Table.Th>          
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {memberRows}
        </Table.Tbody>
      </Table>
    );
  }
}

export default MembersManager;

