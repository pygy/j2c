module.exports = {
    rules: {
        indent: [
            "error", 2
        ],
        quotes: [
            "error",
            "single",
            "avoid-escape"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        semi: [
            "error",
            "never"
        ],
        "no-trailing-spaces": "error",
        "comma-dangle": "error",
        "no-native-reassign": "error"
    },
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module"
    },
    ecmaFeatures: {
        modules: true
    },
    sourceType: "module",
    env: {
        es6: true,
        node: true,
        browser: true
    },
    extends: "eslint:recommended"
}