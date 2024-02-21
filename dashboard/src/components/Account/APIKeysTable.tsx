import React, { useEffect, useState } from 'react';
import { ActionIcon, Anchor,Button, Code, CopyButton, Group, Paper, Tooltip, rem,  Table, Text } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { useAPIKeys } from './APIKeysContext';
import classes from './css/APIKeys.module.css';

const APIKeysTable = () => {
    const { APIKeys, fetchAPIKeys, APIKeysLoading, APIKeysLastUpdated, toggleAPIKeyStatus } = useAPIKeys();
    const { isLoaded } = useOrganization();
    const { user } = useUser();

    const doToggleAPIKeyStatus = (e, apiKeyId) => {
        e.preventDefault();
        toggleAPIKeyStatus(apiKeyId, user.id);
    };
    
    useEffect(() => {
        if (isLoaded) {
            fetchAPIKeys(user.id);
        }
    }, [fetchAPIKeys, APIKeysLastUpdated]);

    if (APIKeysLoading) {
        return null;
    }
    
    const APIKeysBody = APIKeys.map((apiKeyRecord) => {
        return (
            <div className={classes.apiCard}>

                <Paper radius="md" key={apiKeyRecord.id} withBorder p="sm"
                       className={apiKeyRecord.isActive ? classes.enabled : classes.disabled}>

                <Group padding="lg">

                <Text fw={800} size="md">Key:</Text>
            <div className={classes.apiKeyBlock} >

            <CopyButton value={apiKeyRecord.apiKey} timeout={2000}>
            {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="bottom">
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                    {copied ? (
                        <IconCheck style={{ width: rem(16) }} />
                    ) : (
                        <IconCopy className={classes.apiKeyTextDisabled}
                        style={{ width: rem(16) }} />
                    )}
                    </ActionIcon>
                </Tooltip>
            )}
             </CopyButton>

            <CopyButton value={apiKeyRecord.apiKey} timeout={2000}>
            {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="bottom">
                    <Code size="md" onClick={copy}>{apiKeyRecord.apiKey}</Code>
                </Tooltip>
            )}
             </CopyButton>

                </div>

                </Group>

                <Group padding="lg" style={{marginTop:'10px'}}>
                <Text fw={800} size="sm">Created:</Text>
                <Text size="sm">
                { new Date(apiKeyRecord.createdAt).toLocaleString('en-US', 
                                                              { weekday: 'short', 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' }
                                                             )
                }
                </Text>
                </Group>

                <Group style={{marginTop:'5px'}}>
                  <Text fw={800} size="sm">Environment:</Text>
                  <Code>{apiKeyRecord.apiKeyType}</Code>
                </Group>

                <Group style={{marginTop:'5px'}}>
                  <Text fw={800} size="sm">Status:</Text>
                <Text size="sm" className={ (apiKeyRecord.isActive ? classes.apiKeyTextEnabled : classes.apiKeyTextDisabled)}>
                   {apiKeyRecord.isActive ? 'Enabled' : 'Disabled'}
                </Text>
                </Group>

                <Group justify="flex-end">
                <Button variant="light" size="xs" 
                        className={apiKeyRecord.isActive ? 'deactivate' : 'activate'}            
                        onClick={(e) => doToggleAPIKeyStatus(e, apiKeyRecord.id)}>
                {apiKeyRecord.isActive ? 'Disable key' : 'Enable key'}
                </Button>
                </Group>
                </Paper>
                </div>
        );
    });
    
    return (
      <div style={{marginTop:'5px'}}>
            {APIKeysBody}
      </div>
    );
}

export default APIKeysTable;
