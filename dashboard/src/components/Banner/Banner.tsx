import React, { useEffect } from 'react';
import classes from './Banner.module.css';

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

  return (
    <div className={classes.banner}>
      <span>{message}</span>
      <button className={classes.closeButton} onClick={onClose}>X</button>
    </div>
  );
};

export default Banner;

