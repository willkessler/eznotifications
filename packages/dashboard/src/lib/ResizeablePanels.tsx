import React, { useEffect, useState } from 'react';
import classes from './css/ResizablePanels.module.css'; // Assuming you are using CSS modules

interface PanelProps {
    url?: string;
    content?: string;
    minSize: number;
    maxSize: number;
}

interface ResizablePanelsProps {
  top: PanelProps;
  left: PanelProps;
  right: PanelProps;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({ topPanelProps, leftPanelProps, rightPanelProps }) => {
  const [dividerPosition, setDividerPosition] = useState<number>(500);
  const [ isDragging, setIsDragging ] = useState<boolean>(false); // track if currently dragging

  useEffect(() => {
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      if (!isDragging) return;
      setDividerPosition(mouseMoveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onMouseDown = () => {
    setIsDragging(true);
    document.body.style.pointerEvents = 'none';
  };

 useEffect(() => {
    if (!isDragging) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isDragging]);

  return (
    <div className={classes.container}>
      <div className={classes.topPanel}>{topPanelProps.content}</div>
      <div className={classes.panelsContainer}>
        <iframe
          src={leftPanelProps.url}
          style={{
            minWidth:(leftPanelProps.minWidth ? leftPanelProps.minWidth : 500),
            maxWidth:leftPanelProps.maxWidth | 800,
            width: `${dividerPosition}px`
          }}
          className={classes.panel}
          title="Left Panel" />
        <div className={classes.divider} onMouseDown={onMouseDown}></div>
        <iframe
          src={rightPanelProps.url}
          style={{
            minWidth: rightPanelProps.minWidth | 100,
            width: `calc(100% - ${dividerPosition}px - 5px)`
          }}
          className={classes.panel}
          title="Right Panel" />
      </div>
    </div>
  );
};

export default ResizablePanels;
