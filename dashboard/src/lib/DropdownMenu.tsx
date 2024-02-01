  <!-- just an example so we can see later how this was done -->
  
      <Table.Td>
          <Menu shadow="md" width={200}>
            <Menu.Target>
          <Anchor component="button" style={{ fontWeight: 'bold', color: '#000' }} type="button">...</Anchor>
            </Menu.Target>
  
            <Menu.Dropdown>
              <Menu.Label>Preview Notifications</Menu.Label>
              <Menu.Item onClick={ () => { displayPreviewModal(row.content.length==0 ? '(Not set)' : row.content) }}>
                <Text>As a modal</Text>
              </Menu.Item>
              <Menu.Item onClick={ () => { displayBanner(row.content.length==0 ? '(Not set)' : row.content) }}>
                <Text>As a banner</Text>
              </Menu.Item>
              <Menu.Item onClick={ () => { toastNotify(row.content.length==0 ? '(Not set)' : row.content) }}>
                <Text>As a toast</Text>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Label>Updates to this Notification</Menu.Label>
              <Menu.Item onClick= { () => { editNotification(row); }}>
                <Text>Edit</Text>
              </Menu.Item>
              <Menu.Item>
                <Text>Duplicate</Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Table.Td>
