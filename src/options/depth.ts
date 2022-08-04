import { Option } from 'commander';

export default new Option('-d, --depth [number]', 'Deep search of dependencies').argParser(parseInt).default(1);
