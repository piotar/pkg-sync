import { Option } from 'commander';
import { getApplicationData } from '../../utils/getApplicationData';

const appData = getApplicationData();
const { depth } = appData.config;

export default new Option('-d, --depth [number]', 'Deep search of dependencies')
    .default(depth)
    .preset(depth)
    .argParser((value) => parseInt(value, 10));
