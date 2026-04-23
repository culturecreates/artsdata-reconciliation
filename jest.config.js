const shouldRunGlobal = process.env.ENVIRONMENT === 'development';

module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',

    // These will now ONLY be defined if you run 'npm run test:dev'
    globalSetup: shouldRunGlobal ? '../test/setup.ts' : undefined,
    globalTeardown: shouldRunGlobal ? '../test/global-teardown.ts' : undefined,
};