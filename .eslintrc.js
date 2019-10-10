module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  // 选择 eslint 插件
  plugins: ['prettier', 'vue'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)'],
      env: {
        mocha: true,
      },
    },
  ],
  rules: {
    // 自定义 prettier 规则 (实际上，可配置项非常有限)
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        semi: false,
      },
    ],
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // camelcase: "off", // 强制驼峰法命名
    // "no-new": "off", // 禁止在使用new构造一个实例后不赋值
    'space-before-function-paren': 'off', // 函数定义时括号前面不要有空格
    // "no-plusplus": "off", // 禁止使用 ++， ——
    'max-len': 'off', // 字符串最大长度
    'no-unused-vars': 'off', // 允许定义不适应的变量
    // "func-names": "off", // 函数表达式必须有名字
    // "no-param-reassign": "off" // 不准给函数入参赋值
  },
}
