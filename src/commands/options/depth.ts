import { Option } from 'commander';

export default new Option('-d, --depth [number]', 'Deep search of dependencies')
    .default(2)
    .preset(2)
    .argParser((value) => parseInt(value, 10));
