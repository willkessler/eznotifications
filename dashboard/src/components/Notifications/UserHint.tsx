import { useDisclosure } from '@mantine/hooks';
import { Text, Popover } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import React from 'react';

interface UserHintProps {
  children: ReactNode;
  hintText: string;
}

const UserHint: React.FC<UserHintProps> = ({ children, hintText }) => {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <div style={{ display: 'flex', alignItems: 'left', gap: '2px' }}>
      {children}
      <Popover width={200} position="top" withArrow shadow="md" opened={opened}>
        <Popover.Target>
          <IconQuestionMark
            onMouseEnter={open}
            onMouseLeave={close}
            style={{ color: 'black', width: '24px', height: '24px'}}
          />
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
          <Text size="sm">{hintText}</Text>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};


export default UserHint;
