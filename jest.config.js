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
    globalSetup: '<rootDir>/../test/setup.ts',
    globalTeardown: '<rootDir>/../test/teardown.ts',
    testTimeout: 10000,
    maxWorkers: 1,
    silent: true

};