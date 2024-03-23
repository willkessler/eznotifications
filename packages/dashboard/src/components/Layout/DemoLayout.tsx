import React from 'react';
import ResizeablePanels from '../../lib/ResizeablePanels';
import { Group, Image, Text } from '@mantine/core';


const DemoLayout = () => {
  const topPanelContent = (
    <>
      <Group>  
        <Image src="/ThisIsNotADrill_cutout.png" w={25} />
        <Text size="sm"><b>This Is Not A Drill!</b> &mdash; Demo Site</Text>
      </Group>
    </>
  );
  return (
    <ResizeablePanels 
      topPanelProps =  {{ content: topPanelContent, minHeight:'500px', maxHeight:'800px' }}
      leftPanelProps = {{ url: 'http://localhost:5173', minWidth:'500px', maxWidth:'800px' }}
      rightPanelProps= {{ url: 'http://localhost:5174', minWidth:'200px', maxWidth:'800px' }}
    />
  );
};

export default DemoLayout;
