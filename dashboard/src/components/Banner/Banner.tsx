import React, { useEffect } from 'react';
import classes from './Banner.module.css';
import { renderMarkdown } from '../../lib/RenderMarkdown';

interface BannerProps {
  message: string;
  onClose: () => void; // Function to handle closing the banner
}

const Banner: React.FC<BannerProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Call onClose after 5 seconds
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]); // Re-run effect if message changes

  const previewCaveat = "\n\n#### _Please note: this is only a demo, how you display notifications on your site is up to you._";
  const caveatedMessage = message + previewCaveat;
  return (
    <div className={classes.banner}>
      <span dangerouslySetInnerHTML={renderMarkdown(caveatedMessage)}></span>
      <button className={classes.closeButton} onClick={onClose}>X</button>
    </div>
  );
};

export default Banner;

