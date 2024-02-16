// MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LogoComponent from './LogoComponent';
import UserAuthentication from './UserAuthentication';
import classes from './css/MainLayout.module.css';
import Tutorial from './Tutorial';

const MainLayout = () => {
  return (
      <div className={classes.mainLayout}>
        <aside className={classes.sidebar}>
          <LogoComponent />
          <Navbar />
          <UserAuthentication />
        </aside>
        
        <div className={classes.divider} />
        <main className={classes.mainContent}>
          <Outlet /> {/* This is where the routed content will be rendered */}
        </main>
        <Tutorial />
      </div>
  );
};

export default MainLayout;
