import React, { useEffect, useState } from 'react';
import { useOrganization } from "@clerk/clerk-react";
import { Anchor, Table, Text } from '@mantine/core';

const APIKeysTable = () => {
  
  const apiKeys = [
    {
      id: '123',
      createdAt: new Date().toISOString(),
      apiKey: 'foo',
      apiKeyType: 'development',
    }
  ];

  const APIKeysBody = apiKeys.map((apiKeyRecord) => (
    <Table.Tr key={apiKeyRecord.id}>
      <Table.Td>
        {apiKeyRecord.createdAt}
      </Table.Td>
      <Table.Td>
        {apiKeyRecord.apiKey}
      </Table.Td>
      <Table.Td>
        {apiKeyRecord.apiKeyType}
      </Table.Td>
      <Table.Td>
        <Anchor size="xs" component="button" type="button" onClick={() => ToggleAPIKeyActive(apiKeyRecord)}>Switch to Inactive</Anchor>
      </Table.Td>
    </Table.Tr>
  ));
  
  return (
    <div style={{marginTop:'30px'}}>
      <Table verticalSpacing="xs" highlightOnHover withColumnBorders withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Create Date</Table.Th>
            <Table.Th>API Key</Table.Th>
            <Table.Th>Environment</Table.Th>
            <Table.Th>&nbsp;</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {APIKeysBody}
        </Table.Tbody>
      </Table>
    </div>
  );
}

export default APIKeysTable;
