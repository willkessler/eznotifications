import { Burger, Image, Group } from '@mantine/core';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

const Header:React.FC<HeaderProps> = ({opened, toggle}) => {
  return (
    <>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
       <Group gap="xs">
            <a href="/">
          <Image
            pe="xs"
            h={220}
            src="UnifiedFinancialLogo.png" />
            </a>
            <a href="/">
          <Image 
            me="xs"
            h={300}
            src="UnifiedTextLogo2.png" />
            </a>
         </Group>
    </>
  );
};

export default Header;
