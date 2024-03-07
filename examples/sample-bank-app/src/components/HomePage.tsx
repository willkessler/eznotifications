import React from 'react';
import { Card, Text, Title, Button, Group } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from './HomePage.module.css'; // Adjust the path as necessary

export function HomePage() {
  return (
    <div>
        <div className={classes.header}>
          <Title order={2}>Welcome back, Alfonze!</Title>
        </div>
        <Group position="left" className={classes.mainContent} >
          <Card shadow="sm" p="lg" radius="lg">
            <Text weight={500}>Checking Account</Text>
            <Text size="lg" mt="xs">$1,234.56</Text>
          </Card>
          <Card shadow="sm" p="lg" radius="lg">
            <Text weight={500}>Savings Account</Text>
            <Text size="lg" mt="xs">$4,567.89</Text>
          </Card>
          <Card shadow="sm" p="lg" radius="lg">
            <Text weight={500}>Investment Portfolio</Text>
            <Text size="lg" mt="xs">$8,910.11</Text>
          </Card>
        </Group>
      <div className={classes.controls}>
      <Group position="center" mt="md" >
          <Button size="lg">Transfer Money</Button>
          <Button size="lg">Pay Bills</Button>
          <Button size="lg">Deposit Checks</Button>
          <Button size="lg">View Statements</Button>
        </Group>
      </div>
      </div>
  );
}
