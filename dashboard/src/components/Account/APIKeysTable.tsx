import React, { useEffect, useState } from 'react';
import { ActionIcon, Anchor,CopyButton, Tooltip, rem,  Table, Text } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { useAPIKeys } from './APIKeysContext';

const APIKeysTable = () => {
    const { APIKeys, fetchAPIKeys, APIKeysLoading, APIKeysLastUpdated, toggleAPIKeyStatus } = useAPIKeys();
    const { isLoaded } = useOrganization();
    const { user } = useUser();

    const doToggleAPIKeyStatus = (e, apiKeyId) => {
        e.preventDefault();
        toggleAPIKeyStatus(apiKeyId);
    };
    
    useEffect(() => {
        if (isLoaded) {
            fetchAPIKeys(user.id);
        }
    }, [fetchAPIKeys, APIKeysLastUpdated]);

    if (APIKeysLoading) {
        return null;
    }
    
    const APIKeysBody = APIKeys.map((apiKeyRecord) => (
      <Table.Tr key={apiKeyRecord.id}>
        <Table.Td>
            { new Date(apiKeyRecord.createdAt).toLocaleString('en-US', 
                                                              { weekday: 'short', 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' }
                                                             )
            }
        </Table.Td>
        <Table.Td>
          <CopyButton value={apiKeyRecord.apiKey} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                  {copied ? (
                    <IconCheck style={{ width: rem(16) }} />
                  ) : (
                    <IconCopy style={{ width: rem(16) }} />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          {apiKeyRecord.apiKey}
        </Table.Td>
        <Table.Td>
          {apiKeyRecord.apiKeyType}
        </Table.Td>
        <Table.Td>
          {apiKeyRecord.isActive ? 'Enabled' : 'Disabled'}
        </Table.Td>
        <Table.Td>
            <Anchor size="xs" component="button" type="button" onClick={(e) => doToggleAPIKeyStatus(e, apiKeyRecord.id)}>
            {apiKeyRecord.isActive ? 'Disable' : 'Enable'}
             </Anchor>
        </Table.Td>
      </Table.Tr>
    ));
    
    return (
      <div style={{marginTop:'30px'}}>
        <Table verticalSpacing="xs" highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Created On</Table.Th>
              <Table.Th>API Key</Table.Th>
              <Table.Th>Environment</Table.Th>
              <Table.Th>Status</Table.Th>
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
