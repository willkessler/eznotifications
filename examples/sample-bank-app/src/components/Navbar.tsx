import { Anchor, Stack } from '@mantine/core';

const Navbar = () => {
  return (
    <>
          <Stack justify="flex-start" align="flex-start">
            <Anchor href="/" fw={500} fz="lg">Dashboard</Anchor>
            <Anchor href="/pay" fw={500} fz="lg">Pay Your Bills</Anchor>
            <Anchor href="/deposit" fw={500} fz="lg">Make a Deposit</Anchor>
            <Anchor href="/transfer" fw={500} fz="lg">Transfer Money</Anchor>
            <Anchor href="/statements" fw={500} fz="lg">Your Statements</Anchor>
            <br />
            <br />
            <br />
            <br />
            <br />
            <Anchor fw={500} fz="lg">Logout</Anchor>
          </Stack>
    </>
  );
};

export default Navbar;
