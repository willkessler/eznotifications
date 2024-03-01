import React, { useState, useEffect, ReactNode } from 'react';
import { Anchor, Collapse, Text } from '@mantine/core';
import classes from './Expando.module.css';

interface ExpandoProps {
    children: ReactNode;
    openTitle: string;
    closedTitle: string;
    outerStyle?: React.CSSProperties;
    titleStyle?: React.CSSProperties;
    openOnDisplay?: boolean;
}

const Expando: React.FC<ExpandoProps> = ({
    children, 
    openTitle, 
    closedTitle, 
    outerStyle, 
    titleStyle,
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
        <div style={{...outerStyle}}>
            <Anchor
        component="button" 
        type="button" 
        style={{ ...titleStyle }} 
        className={classes.noUnderlineHover}
        onClick={() => setOpened((o) => !o)}>
            <span style={triangleStyle}></span>
            <Text span>{opened ? openTitle : closedTitle}</Text>
            </Anchor>
            <Collapse in={opened}>
            <div>{children}</div>
            </Collapse>
            </div>
    );
}

export default Expando;
