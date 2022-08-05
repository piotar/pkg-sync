import { Argument } from 'commander';

export default new Argument('[path]', 'Path to package (path not set will be set to closest package.json)');
