import cx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Anchor, Button, Group, Radio, Table, TextInput, Textarea, Text } from '@mantine/core';
import { useUser, useOrganization } from "@clerk/clerk-react";
import classes from './InviteUser.module.css';
import InviteMember from './InviteMember';
import PendingInvitationsList from './PendingInvitations';
 
 
const AdminControls = ({ membership }: { membership: OrganizationMembershipResource }) => {
  const [disabled, setDisabled] = useState(false);
  const {
    user: { id: userId },
  } = useUser();
 
  if (membership.publicUserData.userId === userId) {
    console.log('exit early');
    return null;
  }
 
  const remove = async () => {
    setDisabled(true);
    await membership.destroy();
  };
 
  const changeRole = async (role: MembershipRole) => {
    setDisabled(true);
    await membership.update({ role });
    setDisabled(false);
  };
 
  return (
    <>
      ::{" "}
      <button disabled={disabled} onClick={remove}>
        Remove member
      </button>{" "}
      {membership.role === "admin" ? (
        <button disabled={disabled} onClick={() => changeRole("org:member")}>
          Change to member
        </button>
      ) : (
        <button disabled={disabled} onClick={() => changeRole("org:admin")}>
          Change to admin
        </button>
      )}
    </>
  );
};

const MemberList = () => {
  const { memberships, membershipList, membership } = useOrganization({
    membershipList: {},
  });
 
  if (!membershipList) {
    return null;
  }
 
  const isCurrentUserAdmin = membership.role === "org.admin";
 
  const memberRows = membershipList.map((m) => (
    <Table.Tr>
      <Table.Td>{m.publicUserData.firstName} {m.publicUserData.lastName}</Table.Td>
      <Table.Td>{m.publicUserData.identifier}</Table.Td>
      <Table.Td>{(m.role === 'org:admin') ? 'Admin' : 'Member'}</Table.Td>
      <Table.Td>{isCurrentUserAdmin && <AdminControls membership={m} />}</Table.Td>
    </Table.Tr>
  ));

  return (
      <Table verticalSpacing="xs" striped highlightOnHover withColumnBorders withTableBorder>
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
 

const ManageTeam = () => {
  const { invitationList, organization } = useOrganization({ invitationList: {} });
 
  if (!invitationList) {
    return null;
  }
 
  return (
    <div>
      <Text size="lg">Active Teammates</Text>
      <MemberList />

      <InviteMember />
 
      <PendingInvitationsList />
    </div>
  );
}

export default ManageTeam;
