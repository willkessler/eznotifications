import { Title, Text, Anchor } from '@mantine/core';
import classes from './Home.module.css';

export function Home() {
  return (
    <>
      <Title className={classes.title} mt={100}>
       <Text inherit variant="gradient" component="span" gradient={{ from: 'black', to: 'black' }}>EZNotifications</Text>
      </Title>
    </>
  );
}
