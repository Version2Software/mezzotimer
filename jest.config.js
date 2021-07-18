// jest.config.js
module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript',
    transform: {
        '^.+\\.vue$': 'vue-jest'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,vue}'
    ],
}
