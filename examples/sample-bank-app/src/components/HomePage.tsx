import React from 'react';
import { Card, Image, Text, Title, Button, Group } from '@mantine/core';
import '@mantine/core/styles.css';
import DemoControls from './DemoControls';
import classes from './HomePage.module.css'; // Adjust the path as necessary

export function HomePage() {
  return (
    <div>
        <div className={classes.header}>
          <Title order={2} className={classes.welcomeMsg}>Welcome back, Robert!</Title>
        </div>
        <Group position="left" className={classes.mainContent} >
          <Card shadow="sm" p="lg" radius="md"  className={classes.card}>
          <Image 
            radius="md"
            h={120}
            fit="contain"
            src="CheckingAccountIcon.webp" />
            <Text className={classes.cardText} weight={500}>Checking Account</Text>
            <Text size="lg" mt="xs">$1,234.56</Text>
          </Card>
          <Card shadow="sm" p="lg" radius="md" className={classes.card}>
            <Image 
            radius="md"
            h={120}
            fit="contain"
            src="SavingsAccountIcon.webp" />
            <Text className={classes.cardText} weight={500}>Savings Account</Text>
            <Text size="lg" mt="xs">$4,567.89</Text>
          </Card>
          <Card shadow="sm" p="lg" radius="md" className={classes.card}>
          <Image 
            radius="md"
            h={120}
            fit="contain"
            src="PortfolioIcon.webp" />
            <Text className={classes.cardText} weight={500}>Investment Portfolio</Text>
            <Text size="lg" mt="xs">$8,910.11</Text>
          </Card>
        </Group>
        <DemoControls />
    </div>
  );
}
