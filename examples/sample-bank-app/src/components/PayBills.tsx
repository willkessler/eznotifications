import { useEffect } from 'react';
import '@mantine/core/styles.css';
import { Card, Text, Image, Title } from '@mantine/core';
import classes from '../css/MainLayout.module.css'; // Adjust the path as necessary
import { TinadComponent } from '@this-is-not-a-drill/react-ui';
import { usePageId } from './PageIdContext';

export const PayBills = () => {

  const { setPageId } = usePageId();
  useEffect(() => {
    console.log('setting page id to pay');
    setPageId('pay');
  }, [setPageId]);

  return (
    <>
      <Title>Pay Bills</Title>

      <TinadComponent pageId="pay" mode="inline" />

      <Card shadow="sm" p="lg" radius="md"  className={classes.card}>
        <Image 
          radius="md"
          h={120}
          fit="contain"
          src="CheckingAccountIcon.webp" />
        <Text className={classes.cardText}>Checking Account</Text>
        <Text size="lg" mt="xs">$1,234.56</Text>
      </Card>

    </>
  );
}

export default PayBills;
