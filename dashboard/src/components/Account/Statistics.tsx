import React, { useEffect, useState } from 'react';
import { Anchor, Button, Code, Group, Image, Modal, Tabs, Stack, Textarea, Text } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { data } from './StatsData';
import classes from './css/Settings.module.css';

const Statistics = () => {
  return (
    <>
      <Text className={classes.statsTitle} size="xl">User Statistics</Text>
      <LineChart
        w={1000}
        h={300}
        data={data}
        dataKey="date"
        series={[
          { name: 'Apples', color: 'indigo.6' },
          { name: 'Oranges', color: 'blue.6' },
          { name: 'Tomatoes', color: 'teal.6' },
        ]}
        curveType="linear"
      />
    </>
  );
}

export default Statistics;
