module.exports = {
    "parser": "babel-eslint",
    "extends": "airbnb",
    "env": {
        "browser": true,
        "node": true
    },
    "rules": {
        "indent": ["error", 4],//缩进
        "linebreak-style": [0, "error", "windows"], //允许Windows开发环境 Expected linebreaks to be 'LF' but found 'CRLF'
        "eol-last": ["warn", "never"],//Newline required at end of file but not found  eol-last js文件末尾不换行
        "prefer-spread": "error"
    },
    "parserOptions": { //The keyword 'import' is reserved
        "ecmaVersion": 7,
        "sourceType": "module",
    }
}