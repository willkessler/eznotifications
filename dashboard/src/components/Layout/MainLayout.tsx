// MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LogoComponent from './LogoComponent';
import classes from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={classes.mainLayout}>
      <aside className={classes.sidebar}>
        <LogoComponent />
        <Navbar />
      </aside>
      
      <div className={classes.divider} />
      <main className={classes.mainContent}>
        <Outlet /> {/* This is where the routed content will be rendered */}
      </main>
    </div>
  );
};

export default MainLayout;
