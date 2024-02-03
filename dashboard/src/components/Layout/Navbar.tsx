import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Anchor, Group, Text } from '@mantine/core';
import classes from './Navbar.module.css';
import { SignOutButton } from "@clerk/clerk-react"

import {
  IconChartArea,
  IconBellRinging,
  IconSpeakerphone,
  IconFingerprint,
  IconKey,
  IconSettings,
  Icon2fa,
  IconDatabaseImport,
  IconHelp,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
} from '@tabler/icons-react';


const Navbar = () => {
  const isExternalLink = (url) => /^(http|https):\/\//.test(url);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('All Notifications');


  const navBarData = [
    { link: '/', label: 'Your Notifications', icon: IconSpeakerphone },
    { link: '/statistics', label: 'Usage Statistics', icon: IconChartArea }, // Updated with the internal link
    { link: '/settings', label: 'Your Account', icon: IconSettings },
    { link: 'https://tellyourusers-help-pages.super.site', label: 'Help', icon: IconHelp },
    { link: '', label: 'Logout', icon: IconLogout },
  ];

  const navBarLinks = navBarData.map((item) => {
    const Icon = item.icon; // Get the icon component from the item

    // Determine if the link is active based on the current location
    const isActive = location.pathname === item.link;

    return isExternalLink(item.link) ? (
      // Render an anchor for external links
      <Anchor
        className={classes.link}
        data-active={isActive || undefined}
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        key={item.label}
      >
        <Group>
          <Icon className={classes.linkIcon} stroke={1.5} />
          <span className={classes.navbarLabel}>{item.label}</span>
        </Group>
      </Anchor>
    ) : (
      // Render a Link component for internal navigation
      <Link
        to={item.link}
        className={classes.link}
        data-active={isActive || undefined}
        onClick={() => setActiveLink(item.label)}
        key={item.label}
      >
        { (item.label == 'Logout') && 
          <SignOutButton>
            <Group>
              <Icon className={classes.linkIcon} stroke={1.5} />
              <span className={classes.navbarLabel}>{item.label}</span>
            </Group>
          </SignOutButton>
        }
        { (item.label !== 'Logout') && 
            <Group>
              <Icon className={classes.linkIcon} stroke={1.5} />
              <span className={classes.navbarLabel}>{item.label}</span>
            </Group>
        }
      </Link>
    );
  });

  return (
    <nav>
      {navBarLinks}
    </nav>
  );
};

export default Navbar;
