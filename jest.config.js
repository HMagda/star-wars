/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!node-fetch)/"
  ],
  testEnvironment: 'node'
};
