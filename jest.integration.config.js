module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/src/.*/.*(integration|spec))\\.ts$',
  moduleFileExtensions: ['js','json','ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverage: false,
};
