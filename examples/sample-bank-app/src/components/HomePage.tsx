import { Card, Image, Stack, Title, Text, Group } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from '../css/MainLayout.module.css'; // Adjust the path as necessary
import { TinadComponent, TinadTemplateProps } from '@thisisnotadrill/react-ui';
  
const HomePage = () => {

  // Example of a Custom Template that clients could create
  const CustomTemplate: React.FC<TinadTemplateProps> = ({ tinadContent, tinadType, dismiss }) => {
    return (
      <div style={{ padding: '20px', margin: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <h4>Notification Type: {tinadType}</h4>
        <div>Message: {tinadContent}</div>
        {dismiss && <button onClick={dismiss}>Dismiss</button>}
      </div>
    );
  };

  return (
    <div>
      <TinadComponent pageId="home" template={CustomTemplate} mode="modal" />

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
