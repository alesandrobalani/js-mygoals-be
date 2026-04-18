module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testRegex: '(/src/.*/.*(integration|spec))\\.ts$',
  moduleFileExtensions: ['js','json','ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  collectCoverage: false,
  extensionsToTreatAsEsm: ['.ts'],
};
