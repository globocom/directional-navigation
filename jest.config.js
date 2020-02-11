module.exports = {
  testURL: 'http://localhost',
  moduleNameMapper: { 'clappr-zepto': '<rootDir>node_modules/clappr-zepto/zepto.js' },
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverageFrom: [
    '**/src/**/*.{js}',
    '!**/*.test.*',
    '!**/*.spec.*',
  ],
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
}
