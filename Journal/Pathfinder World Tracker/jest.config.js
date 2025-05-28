export default {
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js'],
    transform: {
        '^.+\\.js$': ['babel-jest', { configFile: './.babelrc' }]
    },
    testMatch: ['**/tests/**/*.test.js', '**/scripts/tests/**/*.test.js'],
    setupFiles: ['./tests/setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/scripts/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(bootstrap)/)'
    ],
    testEnvironmentOptions: {
        url: 'http://localhost'
    },
    moduleDirectories: ['node_modules', 'scripts'],
    roots: ['<rootDir>/scripts', '<rootDir>/tests']
}; 