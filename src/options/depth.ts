import { Option } from 'commander';

export default new Option('--depth [number]', 'Deep search of dependencies')
    .argParser(parseInt)
    .default(Number.POSITIVE_INFINITY);
