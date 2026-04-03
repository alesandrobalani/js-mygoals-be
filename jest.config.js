module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  moduleFileExtensions: ['js','json','ts'],
  rootDir: '.',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.ts'],
  extensionsToTreatAsEsm: ['.ts'],
};
