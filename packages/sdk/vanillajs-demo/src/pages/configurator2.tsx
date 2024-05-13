import { SegmentedControl } from '@mantine/core';
import classes from './css/GradientSegmentedControl.module.css';

const Configurator2 = () => {
  return (
    <div  style={{backgroundColor:'#000', height:'100%'}}>
      <SegmentedControl
        radius="xl"
        size="md"
        data={['Toast', 'Modal', 'Inline', 'Banner']}
        style={{ width:'100%' }}
        classNames={classes}
      />
    </div>
  );
}

export default Configurator2;
