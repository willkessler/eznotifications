import React, { useState, useEffect } from 'react';
import { Anchor, Collapse, Text } from '@mantine/core';

interface ExpandoProps {
  children: ReactNode;
  openTitle: string;
  closedTitle: string;
  outerStyle?: React.CSSProperties;
  openOnDisplay?: boolean;
}

const Expando: React.FC<ExpandoProps> = ({
  children, 
  openTitle, 
  closedTitle, 
  outerStyle, 
  openOnDisplay = false
}) => {

  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setOpened(openOnDisplay); 
  }, [openOnDisplay]);

  const triangleStyle = {
    display: 'inline-block', // Ensure proper rendering
    marginRight: '6px',
    width: '0',
    height: '0',
    borderTop: '6px solid transparent',
    borderBottom: '6px solid transparent',
    borderLeft: opened ? '6px solid #aaa' : '0',
    borderRight: !opened ? '6px solid #aaa' : '0',
    transform: opened ? 'rotate(90deg)' : 'rotate(-180deg)',
    transition: 'transform 0.1s ease',
  };

  return (
    <div>
      <Anchor component="button" type="button" style={{ color: '#000' }} onClick={() => setOpened((o) => !o)}>
        <span style={triangleStyle}></span>
        <Text style={{...outerStyle}} span="component">{opened ? openTitle : closedTitle}</Text>
      </Anchor>
      <Collapse in={opened}>
        <div>{children}</div>
      </Collapse>
    </div>
  );
}

export default Expando;
