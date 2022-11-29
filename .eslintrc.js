module.exports = {
  "root": true,
  "ignorePatterns": ['.eslintrc.js', '.prettierrc.js'],
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": ['import'],
  "rules": {
    "import/no-extraneous-dependencies": [
      "error", {
        "devDependencies": false,
        "optionalDependencies": false,
        "peerDependencies": false
      }
    ],
    "prettier/prettier": [
      "error",
      require('./.prettierrc.js')
    ],
  }
}
