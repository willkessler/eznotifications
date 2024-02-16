import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Table, TextInput, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './css/InviteUser.module.css';
import InviteMember from './InviteMember';
import PendingInvitationsList from './PendingInvitations';
 
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
      <Anchor size="xs" component="button" style={{marginRight:'10px', paddingRight: '10px', borderRight:'1px solid'}} onClick={removeMember}>
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

export default MembersManager;

