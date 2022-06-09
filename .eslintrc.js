module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "globals": {},
  "rules": {
    "@typescript-eslint/indent": [
      "warn",
      2
    ],
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
