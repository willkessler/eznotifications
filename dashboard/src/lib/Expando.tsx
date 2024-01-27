import React, { useState } from 'react';
import { Anchor, Collapse, Text } from '@mantine/core';

interface ExpandProps {
  children: ReactNode;
  openTitle: string;
  closedTitle: string;
  outerStyle?: React.CSSProperties;
}

const Expando: React.FC<ExpandProps> = ({children, openTitle, closedTitle, outerStyle}) => {
  const [opened, setOpened] = useState(false);

  const triangleStyle = {
    display: 'inline-block', // Ensure proper rendering
    marginRight: '6px',
    width: '0',
    height: '0',
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: opened ? '6px solid black' : '0',
    borderRight: !opened ? '6px solid black' : '0',
    transform: opened ? 'rotate(90deg)' : 'rotate(-180deg)',
    transition: 'transform 0.1s ease',
  };

  return (
    <div style={{...outerStyle}}>
      <Anchor component="button" type="button" style={{ color: '#000' }} onClick={() => setOpened((o) => !o)}>
        <span style={triangleStyle}></span>
        <Text span="component">{opened ? openTitle : closedTitle}</Text>
      </Anchor>
      <Collapse in={opened}>
        <div style={{marginLeft: '12px' }}>{children}</div>
      </Collapse>
    </div>
  );
}

export default Expando;
