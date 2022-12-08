module.exports = {
    /**
     * 指定脚本的运行环境
     */
    env: {
        browser: true,
        node: true,
        es2021: true,
        es6: true // 启用es6语法
    },
    /* 继承其他配置文件中开启的规则 */
    extends: [
        "eslint:recommended", // 开启ESLint推荐的规则
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/jsx-runtime",
        "prettier",
        "plugin:prettier/recommended"
    ],
    overrides: [
    ],
    /* 指定如何解析语法 将 TypeScript 转换成与 estree 兼容的形式*/
    parser: "@typescript-eslint/parser",
    /* 解析器选项配置*/
    parserOptions: {
        ecmaVersion: "latest", // 指定想要使用的ECMAScript版本
        sourceType: "module",
        jsxPragma: "React",
        // 额外的语言配置
        ecmaFeatures: {
            jsx: true // 启用JSX
        }
    },
    /* 第三方插件 */
    plugins: [
        "react",
        "@typescript-eslint",
        "prettier"
    ],
    // "off" 或 0 - 关闭规则
    // "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
    // "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
    rules: {
			// eslint (http://eslint.cn/docs/rules)
			"no-var": "error", // 要求使用 let 或 const 而不是 var
			"no-multiple-empty-lines": ["error", { max: 1 }], // 不允许多个空行
			"no-use-before-define": "off", // 禁止在 函数/类/变量 定义之前使用它们
			"prefer-const": "off", // 此规则旨在标记使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
			"no-irregular-whitespace": "off", // 禁止不规则的空白

			// typeScript (https://typescript-eslint.io/rules)
			"@typescript-eslint/no-unused-vars": "off", // 禁止定义未使用的变量
			"@typescript-eslint/no-inferrable-types": "off", // 可以轻松推断的显式类型可能会增加不必要的冗长
			"@typescript-eslint/no-namespace": "off", // 禁止使用自定义 TypeScript 模块和命名空间。
			"@typescript-eslint/no-explicit-any": "off", // 禁止使用 any 类型
			"@typescript-eslint/ban-ts-ignore": "off", // 禁止使用 @ts-ignore
			"@typescript-eslint/ban-types": "off", // 禁止使用特定类型
			"@typescript-eslint/explicit-function-return-type": "off", // 不允许对初始化为数字、字符串或布尔值的变量或参数进行显式类型声明
			"@typescript-eslint/no-var-requires": "off", // 不允许在 import 语句中使用 require 语句
			"@typescript-eslint/no-empty-function": "off", // 禁止空函数
			"@typescript-eslint/no-use-before-define": "off", // 禁止在变量定义之前使用它们
			"@typescript-eslint/ban-ts-comment": "off", // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
			"@typescript-eslint/no-non-null-assertion": "off", // 不允许使用后缀运算符的非空断言(!)
			"@typescript-eslint/explicit-module-boundary-types": "off", // 要求导出函数和类的公共类方法的显式返回和参数类型

		}
}
