import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Anchor, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './css/Navbar.module.css';
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
  IconHorseToy,
  IconSandbox,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
} from '@tabler/icons-react';

interface NavbarProps {
  toggleMobile: () => void;
  toggleDesktop: () => void;
}


const Navbar: React.FC<NavbarProps> = ({ toggleMobile, toggleDesktop }) => {
  const isExternalLink = (url:string):boolean => /^(http|https):\/\//.test(url);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('All Notifications')
  const [opened, handlers] = useDisclosure();

  const navBarData = [
    { link: '/', label: 'Notifications', icon: IconSpeakerphone, dataTour: 'notifications' },
    { link: '/sandbox', label: 'Sandbox', icon: IconHorseToy, dataTour: 'sandbox' },
    { link: '/settings/account', label: 'Account', icon: IconSettings, dataTour: 'account' },
    { link: 'https://tellyourusers-help-pages.super.site', label: 'Help', icon: IconHelp, dataTour: 'help' },
    { link: '', label: 'Logout', icon: IconLogout, dataTour: 'logout' },
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
        data-tour={item.dataTour}
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        key={item.label}
      >
        <Group style={{ marginLeft:'5px'}}>
          <Icon className={classes.linkIcon} stroke={1.5} />
          <span className={classes.navbarLabel}>{item.label}</span>
        </Group>
      </Anchor>
    ) : (
      // Render a Link component for internal navigation
      <Link
        to={item.link}
        className={classes.link}
        data-tour={item.dataTour}
        data-active={isActive || undefined}
        onClick={() => {
          setActiveLink(item.label);
          toggleMobile();
        }}
        key={item.label}
      >
        { (item.label == 'Logout') && 
          <SignOutButton>
            <Group style={{ marginLeft:'5px'}}>
              <Icon className={classes.linkIcon} stroke={1.5} />
              <span className={classes.navbarLabel}>{item.label}</span>
            </Group>
          </SignOutButton>
        }
        { (item.label !== 'Logout') && 
            <Group style={{ marginLeft:'5px'}}>
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
