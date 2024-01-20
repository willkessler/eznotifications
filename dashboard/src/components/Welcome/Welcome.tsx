import { Title, Text, Anchor } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Your {' '} <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>EZNotifications</Text>
      </Title>
    </>
  );
}
