import React, { useEffect, useState } from 'react';
import { ActionIcon, Anchor,Card, Code, CopyButton, Group, Tooltip, rem,  Table, Text } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useUser, useOrganization } from "@clerk/clerk-react";
import { useAPIKeys } from './APIKeysContext';
import classes from './css/APIKeys.module.css';
import { useMediaQuery } from '@mantine/hooks';

const APIKeysTable = () => {
    const { APIKeys, fetchAPIKeys, APIKeysLoading, APIKeysLastUpdated, toggleAPIKeyStatus } = useAPIKeys();
    const { isLoaded } = useOrganization();
    const { user } = useUser();
    // If on a small screen use cards for the api keys, not a table
    const isSmallScreen = useMediaQuery('(max-width: 768px)');

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

            <Card padding="md" shadow="sm" radius="md" key={apiKeyRecord.id}
           className={apiKeyRecord.isActive ? classes.enabled : classes.disabled}>
                <Card.Section inheritPadding="true">
                <Group>
                <Text fw={800}>Created:</Text>
                <Text>
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
            </Card.Section>

            <Card.Section inheritPadding={true}>
                <Group>                
                <Text>Key:</Text>
            <div className={classes.apiKeyBlock} >
            <CopyButton value={apiKeyRecord.apiKey} timeout={2000}>
            {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                    {copied ? (
                        <IconCheck style={{ width: rem(16) }} />
                    ) : (
                        <IconCopy className={ (apiKeyRecord.isActive ? classes.apiKeyTextEnabled : classes.apiKeyTextDisabled) }
                        style={{ width: rem(16) }} />
                    )}
                    </ActionIcon>
                    </Tooltip>
            )}
             </CopyButton>
                <Text className={classes.apiKeyText}>{apiKeyRecord.apiKey}</Text>
            </div>
                </Group>
            </Card.Section>

            <Card.Section inheritPadding={true}>
            Environment: <Code>{apiKeyRecord.apiKeyType}</Code>
            </Card.Section>

            <Card.Section inheritPadding={true} withBorder={true}>
                <Group>
                  <Text>Status:</Text>
                  <Code>{apiKeyRecord.isActive ? 'Enabled' : 'Disabled'}</Code>
                </Group>
            </Card.Section>

            <Card.Section inheritPadding={true}>
            <Anchor 
              className={apiKeyRecord.isActive ? classes.deactivate : classes.activate}
              size="sm" 
              component="button" 
              type="button" 
              onClick={(e) => doToggleAPIKeyStatus(e, apiKeyRecord.id)}>
              {apiKeyRecord.isActive ? 'Disable' : 'Enable'}
            </Anchor>
            </Card.Section>
                </Card>
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
