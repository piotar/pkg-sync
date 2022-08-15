import { PicomatchOptions } from 'picomatch';

export const matcherOptions: PicomatchOptions = {
    nocase: true,
    dot: true,
};

export const excludeRules = [
    '.npmignore',
    '.gitignore',
    '/package.json',
    '**/.git',
    '**/.svn',
    '**/.hg',
    '**/CVS',
    '**/.git/**',
    '**/.svn/**',
    '**/.hg/**',
    '**/CVS/**',
    '/.lock-wscript',
    '/.wafpickle-*',
    '/build/config.gypi',
    'npm-debug.log',
    '**/.npmrc',
    '.*.swp',
    '.DS_Store',
    '**/.DS_Store/**',
    '._*',
    '**/._*/**',
    '*.orig',
    '/package-lock.json',
    '/yarn.lock',
    '/pnpm-lock.yaml',
    '/archived-packages/**',
    '**/*~',
];

export const includeDirectoriesRules = ['dist', 'lib', 'build', 'src'];
