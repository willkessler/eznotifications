import { Card, Image, Text, Group } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from '../css/MainLayout.module.css'; // Adjust the path as necessary

const HomePage = () => {
  return (
    <div>
      <Card shadow="sm" p="md" radius="md" m="sm">
        this is a notification
      </Card>

        <Group>
          <Card shadow="sm" p="lg" radius="md"  className={classes.card}>
            <Image 
              radius="md"
              h={120}
              fit="contain"
              src="CheckingAccountIcon.webp" />
              <Text className={classes.cardText}>Checking Account</Text>
              <Text size="lg" mt="xs">$1,234.56</Text>
          </Card>
          <Card shadow="sm" p="lg" radius="md" className={classes.card}>
            <Image 
            radius="md"
            h={120}
            fit="contain"
            src="SavingsAccountIcon.webp" />
            <Text className={classes.cardText}>Savings Account</Text>
            <Text size="lg" mt="xs">$4,567.89</Text>
          </Card>
          <Card shadow="sm" p="lg" radius="md" className={classes.card}>
          <Image 
            radius="md"
            h={120}
            fit="contain"
            src="PortfolioIcon.webp" />
            <Text className={classes.cardText}>Investment Portfolio</Text>
            <Text size="lg" mt="xs">$8,910.11</Text>
          </Card>
        </Group>
    </div>
  );
}

export default HomePage;
