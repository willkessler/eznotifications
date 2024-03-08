import { Anchor, Stack } from '@mantine/core';
import classes from '../css/MainLayout.module.css';

const Navbar = () => {
  return (
    <>
      <Stack justify="flex-start" align="flex-start">
            <Anchor className={classes.navbarLinks} href="/" fz="sm">Dashboard</Anchor>
            <Anchor className={classes.navbarLinks} href="/pay" fz="sm">Pay Your Bills</Anchor>
            <Anchor className={classes.navbarLinks} href="/deposit" fz="sm">Make a Deposit</Anchor>
            <Anchor className={classes.navbarLinks} href="/transfer" fz="sm">Transfer Money</Anchor>
            <Anchor className={classes.navbarLinks} href="/statements" fz="sm">Your Statements</Anchor>
            <Anchor className={classes.navbarLinks} href="/about" fz="sm">About Us</Anchor>
            <br />
            <br />
            <br />
            <br />
            <Anchor className={classes.navbarLinks} fz="sm">Logout</Anchor>
          </Stack>
    </>
  );
};

export default Navbar;
