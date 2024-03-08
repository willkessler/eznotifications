import '@mantine/core/styles.css';
import { Card, Code, Image, Text, Button, Group } from '@mantine/core';
import classes from '../css/MainLayout.module.css';

const goHome = () => {
  window.location = '/';
}

export const About = () => {
    return (
        <>

      <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.aboutCard}>
      <Card.Section>
        <Image
          src="ThisIsNotADrill_cutout.png"
          height={400}
        />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text size="xl" fw={400}>Welcome to the <Text span style={{fontStyle:'italic'}}>This Is Not A Drill! (TINAD)</Text> Playground</Text>
      </Group>

       <Text size="md">
          This playground provides a simulated web application for a regional bank. 
          Your TINAD notifications will show up here once you put your 
          temporary API key into the file <Code>main.tsx</Code>, in the <Code>init()</Code> call that configures the service.
          The links in the left bar, e.g. <Text span fw={800}>Pay Your Bills</Text>, will display a specific notification 
          tied to that pageId in the TINAD dashboard.
          Watch the tutorial video below for a quick explanation, or just play around in the code editor.
        </Text>
  
      <Button onClick={goHome} color="blue" fullWidth mt="md" radius="md">
        Ok, I got the idea! Take me to the home page
      </Button>
    </Card>
        </>
  );
}

export default About;
