/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define('vs/basic-languages/javascript/javascript', ['require', 'exports', '../fillers/monaco-editor-core'], function (require, exports, monaco_editor_core) {
  'use strict'
  Object.defineProperty(exports, '__esModule', {value: true})
  exports.language = exports.conf = void 0
  exports.conf = {
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    onEnterRules: [
      {
        // e.g. /** | */
        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
        afterText: /^\s*\*\/$/,
        action: {
          indentAction: monaco_editor_core.languages.IndentAction.IndentOutdent,
          appendText: ' * '
        }
      },
      {
        // e.g. /** ...|
        beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
        action: {
          indentAction: monaco_editor_core.languages.IndentAction.None,
          appendText: ' * '
        }
      },
      {
        // e.g.  * ...|
        beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
        action: {
          indentAction: monaco_editor_core.languages.IndentAction.None,
          appendText: '* '
        }
      },
      {
        // e.g.  */|
        beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
        action: {
          indentAction: monaco_editor_core.languages.IndentAction.None,
          removeText: 1
        }
      }
    ],
    // `${`无法自动关闭
    autoClosingPairs: [
      {open: '{', close: '}'},
      {open: '[', close: ']'},
      {open: '(', close: ')'},
      {open: '"', close: '"', notIn: ['string']},
      {open: "'", close: "'", notIn: ['string', 'comment']},
      {open: '`', close: '`', notIn: ['string', 'comment']},
      {open: '/**', close: ' */', notIn: ['string']}
    ],
    folding: {
      markers: {
        start: new RegExp('^\\s*//\\s*#?region\\b'),
        end: new RegExp('^\\s*//\\s*#?endregion\\b')
      }
    }
  }
  exports.language = {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',
    tokenPostfix: '.js',
    unicode: true,
    keywords: [
      'break',
      'catch',
      'continue',
      'debugger',
      'default',
      'do',
      'else',
      'export',
      'finally',
      'for',
      'from',
      'if',
      'import',
      'switch',
      'try',
      'while',
      'with'
    ],
    transitivities: [
      'return',
      'await',
      'case',
      'throw',
      'yield'
    ],
    declarations: [
      'const',
      'let',
      'var',
      // 'get',
      // 'set',
      'class',
      'extends',
      'static',
      'async',
      'function',
      'namespace'
    ],
    operations: [
      'of',
      'in',
      'new',
      'delete',
      'typeof',
      'instanceof',
      'void'
    ],
    constants: [
      'false',
      'true',
      'null',
      'undefined',
      'NaN',
      'Infinity'
    ],
    builtins: [
      'window',
      'global',
      'console',
      'document',
      'navigator',
      'process'
    ],
    highlights: [
      'decodeURI',
      'decodeURIComponent',
      'encodeURI',
      'encodeURIComponent',
      'eval',
      'isFinite',
      'isNaN',
      'parseFloat',
      'parseInt',
      'require',
      '$'
    ],
    globalHighlights: [
      'Math',
      'JSON'
    ],
    specialObjects: [
      'Object',
      'Array',
      'Math',
      'JSON',
      'Number',
      'String'
    ],
    consoleProperties: [
      'assert',
      'clear',
      'count',
      'countReset',
      'debug',
      'dir',
      'dirxml',
      'error',
      'group',
      'groupCollapsed',
      'groupEnd',
      'info',
      'log',
      'table',
      'time',
      'timeEnd',
      'timeLog',
      'trace',
      'warn'
    ],
    mathProperties: [
      'E',
      'LN2',
      'LN10',
      'LOG2E',
      'LOG10E',
      'PI',
      'SQRT1_2',
      'SQRT2',
      'abs',
      'acos',
      'acosh',
      'asin',
      'asinh',
      'atan',
      'atanh',
      'atan2',
      'cbrt',
      'ceil',
      'clz32',
      'cos',
      'cosh',
      'exp',
      'expm1',
      'floor',
      'fround',
      'hypot',
      'imul',
      'log',
      'log1p',
      'log10',
      'log2',
      'max',
      'min',
      'pow',
      'random',
      'round',
      'sign',
      'sin',
      'sinh',
      'sqrt',
      'tan',
      'tanh',
      'trunc'
    ],
    objectProperties: [
      'assign',
      'create',
      'defineProperty',
      'defineProperties',
      'entries',
      'freeze',
      'getOwnPropertyDescriptor',
      'getOwnPropertyNames',
      'getOwnPropertySymbols',
      'getPrototypeOf',
      'is',
      'isExtensible',
      'isFrozen',
      'isSealed',
      'keys',
      'preventExtensions',
      'seal',
      'setPrototypeOf',
      'values'
    ],
    arrayProperties: [
      'from',
      'isArray',
      'of'
    ],
    jsonProperties: [
      'parse',
      'stringify'
    ],
    numberProperties: [
      'EPSILON',
      'MAX_SAFE_INTEGER',
      'MAX_VALUE',
      'MIN_SAFE_INTEGER',
      'MIN_VALUE',
      'NaN',
      'NEGATIVE_INFINITY',
      'POSITIVE_INFINITY',
      'isNaN',
      'isFinite',
      'isInteger',
      'isSafeInteger',
      'parseFloat',
      'parseInt'
    ],
    stringProperties: [
      'fromCharCode',
      'fromCodePoint',
      'raw'
    ],
    objectKeywords: [
      'await'
    ],
    objectDeclarations: [
      'get',
      'set',
      // 'class',
      // 'extends',
      'async',
      'static',
      // 'function'
    ],
    operators: [
      '<',
      '>',
      '<=',
      '>=',
      '==',
      '!=',
      '===',
      '!==',
      '+',
      '-',
      '**',
      '*',
      '/',
      '%',
      '++',
      '--',
      '<<',
      '</',
      '>>',
      '>>>',
      '&',
      '|',
      '^',
      '!',
      '~',
      '~~',
      '&&',
      '||',
      '??',
      '=',
      '+=',
      '-=',
      '*=',
      '**=',
      '/=',
      '%=',
      '<<=',
      '>>=',
      '>>>=',
      '&=',
      '|=',
      '^=',
      '@'
    ],
    // we include these common regular expressions
    variable: /[A-Za-z_$][A-Za-z0-9_$]*/,
    symbols: /[=><!~?:&|+\-*\/\^%#]+/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,
    hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
    regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
    regexpesc: /\\(?:[bBdDfnrsStvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
    // The main tokenizer for our languages
    tokenizer: {
      root: [
        {include: 'whitespace'},
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInRoot'},
        {include: 'blockKeywords'},
        {include: 'globalVariables'},
        {include: 'common'}
      ],
      block: [
        {include: 'whitespace'},
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInBrace'},
        {include: 'blockKeywords'},
        {include: 'globalVariables'},
        {include: 'common'}
      ],
      matchBracketInRoot: [
        [
          /[{}\[\]()]/,
          {
            cases: {
              '$0=={': {token: 'delimiter-bracket', next: '@block'},
              '$0==[': {token: 'delimiter-bracket', next: '@array'},
              '$0==(': {token: 'delimiter-bracket', next: '@parenthesis'},
              '$0==}': {token: 'delimiter-bracket-invalid'},
              '$0==]': {token: 'delimiter-bracket-invalid'},
              '$0==)': {token: 'delimiter-bracket-invalid'}
            }
          }
        ]
      ],
      // matchBracketInBlock: [
      //   [
      //     /[{}\[\]()]/,
      //     {
      //       cases: {
      //         '$0=={': {token: 'delimiter-bracket', next: '@block'},
      //         '$0==}': {token: 'delimiter-bracket', next: '@pop'},
      //         '$0==[': {token: 'delimiter-bracket', next: '@array'},
      //         '$0==]': {token: 'delimiter-bracket', next: '@pop'},
      //         '$0==(': {token: 'delimiter-bracket', next: '@parenthesis'},
      //         '$0==)': {token: 'delimiter-bracket', next: '@pop'}
      //       }
      //     }
      //   ]
      // ],
      matchBracketInBrace: [
        [
          /[{}\[\]()]/,
          {
            cases: {
              '$0==}': {token: 'delimiter-bracket', next: '@pop'},
              '$0=={': {token: 'delimiter-bracket', next: '@block'},
              '$0==[': {token: 'delimiter-bracket', next: '@array'},
              '$0==(': {token: 'delimiter-bracket', next: '@parenthesis'},
              '$0==]': {token: 'delimiter-bracket-invalid'},
              '$0==)': {token: 'delimiter-bracket-invalid'}
            }
          }
        ]
      ],
      matchBracketInSquare: [
        [
          /[{}\[\]()]/,
          {
            cases: {
              '$0==]': {token: 'delimiter-bracket', next: '@pop'},
              '$0=={': {token: 'delimiter-bracket', next: '@object'},
              '$0==[': {token: 'delimiter-bracket', next: '@array'},
              '$0==(': {token: 'delimiter-bracket', next: '@parenthesis'},
              '$0==}': {token: 'delimiter-bracket-invalid'},
              '$0==)': {token: 'delimiter-bracket-invalid'}
            }
          }
        ]
      ],
      matchBracketInParenthesis: [
        [
          /[{}\[\]()]/,
          {
            cases: {
              '$0==)': {token: 'delimiter-bracket', next: '@pop'},
              '$0=={': {token: 'delimiter-bracket', next: '@object'},
              '$0==[': {token: 'delimiter-bracket', next: '@array'},
              '$0==(': {token: 'delimiter-bracket', next: '@parenthesis'},
              '$0==}': {token: 'delimiter-bracket-invalid'},
              '$0==]': {token: 'delimiter-bracket-invalid'}
            }
          }
        ]
      ],
      matchBracketInExpression: [
        [
          /[{}\[\]()]/,
          {
            cases: {
              '$0=={': {token: 'delimiter-bracket', next: '@object'},
              '$0==[': {token: 'delimiter-bracket', next: '@array'},
              '$0==(': {token: 'delimiter-bracket', next: '@parenthesis'},
              '$0~[}\\])]': {token: '@rematch', next: '@pop'},
            }
          }
        ]
      ],
      array: [
        {include: 'whitespace'},
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInSquare'},
        {include: 'blockKeywords'},
        {include: 'globalVariables'},
        {include: 'common'}
      ],
      parenthesis: [
        {include: 'whitespace'},
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInParenthesis'},
        {include: 'blockKeywords'},
        {include: 'globalVariables'},
        {include: 'common'}
      ],
      object: [
        {include: 'whitespace'},
        // key : function | key : param => | key : (...) =>
        [
          /(@variable)(\s*:\s*)(?=(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>)/,
          [
            'function',
            {token: 'delimiter', next: '@functionHead'}
          ]
        ],
        // key (...) {
        [
          /(@variable)(?=\s*\([^)]*\)\s*\{)/,
          [
            'function'
          ]
        ],
        // 'key' (...) {
        [
          /'(?=[^']*'\s*\([^)]*\)\s*\{)/,
          'string-bracket',
          '@method_name_string_single'
        ],
        // "key" (...) {
        [
          /"(?=[^']*"\s*\([^)]*\)\s*\{)/,
          'string-bracket',
          '@method_name_string_double'
        ],
        // 'key' : function | 'key' : param => | key : (...) =>
        [
          /(?='[^']*'\s*:\s*(?:(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>))/,
          '',
          '@objectFunctionAssignmentKey'
        ],
        // "key" : function | "key" : param => | key : (...) =>
        [
          /(?="[^"]*"\s*:\s*(?:(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>))/,
          '',
          '@objectFunctionAssignmentKey'
        ],
        // key : {
        [
          /(@variable)(\s*:\s*)(\{)/,
          [
            'property',
            'delimiter',
            {token: 'delimiter-bracket', next: '@object'}
          ]
        ],
        // : {
        [
          /(:\s*)(\{)/,
          [
            'delimiter',
            {token: 'delimiter-bracket', next: '@object'}
          ]
        ],
        // key :
        [
          /(@variable)(\s*:)/,
          [
            'property',
            'delimiter'
          ]
        ],
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInBrace'},
        {include: 'objectKeywords'},
        {include: 'globalVariables'},
        {include: 'common'}
      ],
      objectFunctionAssignmentKey: [
        {include: 'whitespace'},
        [/'/, 'string-bracket', '@method_name_string_single'],
        [/"/, 'string-bracket', '@method_name_string_double'],
        [/:/, {token: 'delimiter', switchTo: '@objectFunctionAssignmentValue'}],
        ['', '', '@pop']
      ],
      objectFunctionAssignmentValue: [
        {include: 'whitespace'},
        [/(?=async|function(?:[\s(*]|$)|(?:@variable|\([^)]*\))\s*=>)/, '', '@functionHead'],
        ['', '', '@pop']
      ],
      propertyJoint: [
        [/\s*\.\s*/, {token: 'delimiter', switchTo: '@propertyName'}],
        {include: 'whitespace'},
        [/(?=.)/, '', '@pop']
      ],
      propertyName: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/(\s*[\p{L}$_\d]+\s*)(\()?/u, {
          cases: {
            '$2~\\(': [
              'function',
              {token: 'delimiter', switchTo: '@parenthesis'}
            ],
            // '__proto__'无法生成Hash表
            '~(?:prototype|__proto__)': {token: 'identifier-global', switchTo: '@propertyJoint'},
            'toString': {token: 'identifier-global', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      consoleJoint: [
        {include: 'whitespace'},
        [/\./, {token: 'delimiter', switchTo: '@consoleProperties'}],
        [/(?=.)/, '', '@pop']
      ],
      consoleProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@consoleProperties': {token: 'keyword-highlight', next: '@pop'},
            '@default': {token: 'property', next: '@pop'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      mathProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@mathProperties': {token: 'keyword-highlight', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      objectProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@objectProperties': {token: 'keyword-highlight', switchTo: '@propertyJoint'},
            '~(?:prototype|__proto__)': {token: 'identifier-global', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      arrayProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@arrayProperties': {token: 'keyword-highlight', switchTo: '@propertyJoint'},
            '~(?:prototype|__proto__)': {token: 'identifier-global', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      jsonProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@jsonProperties': {token: 'keyword-highlight', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      numberProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@numberProperties': {token: 'keyword-highlight', switchTo: '@propertyJoint'},
            '~(?:prototype|__proto__)': {token: 'identifier-global', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      stringProperties: [
        {include: 'whitespace'},
        {include: 'functionAssignmentSwitcher'},
        [/@variable/, {
          cases: {
            '@stringProperties': {token: 'keyword-highlight', switchTo: '@propertyJoint'},
            '~(?:prototype|__proto__)': {token: 'identifier-global', switchTo: '@propertyJoint'},
            '@default': {token: 'property', switchTo: '@propertyJoint'}
          }
        }],
        [/(?=.)/, '', '@pop']
      ],
      question: [
        {include: 'whitespace'},
        [/\./, {token: 'delimiter', switchTo: '@propertyName'}],
        [/(?=.)/, {token: '', switchTo: '@ternary'}]
      ],
      ternary: [
        [/:/, {token: 'operator', switchTo: '@operation'}],
        {include: 'whitespace'},
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInExpression'},
        {include: 'blockKeywords'},
        {include: 'globalVariables'},
        {include: 'common'}
      ],
      operation: [
        {include: 'whitespace'},
        [/(?:\{)/, {token: 'delimiter-bracket', switchTo: '@object'}],
        [/(?=.)/, '', '@pop']
      ],
      functionAssignment: [
        [
          /(@variable)(\s*=\s*)(?=(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>)/,
          [
            'function',
            {token: 'operator', next: '@functionHead'}
          ]
        ]
      ],
      functionAssignmentSwitcher: [
        [
          /(@variable)(\s*=\s*)(?=(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>)/,
          [
            'function',
            {token: 'operator', switchTo: '@functionHead'}
          ]
        ]
      ],
      functionCall: [
        [
          /(@variable)(?=\s*(?:\?\.\s*)?\()/,
          {
            cases: {
              '@keywords': 'keyword',
              '@declarations': 'keyword-declaration',
              '@transitivities': {token: 'keyword', next: '@operation'},
              '@operations': 'keyword-operation',
              '@constants': 'keyword-constant',
              '@builtins': 'keyword-builtin',
              '@highlights': 'keyword-highlight',
              '@default': 'function'
            }
          }
        ]
      ],
      functionDeclaration: [
        [/(?=function(?:[\s(*]|$)|(?:@variable|\([^()]*\))\s*=>)/, '', '@functionHead'],
      ],
      functionHead: [
        {include: 'whitespace'},
        [/function(?=[\s(*]|$)/, {token: 'keyword-declaration', switchTo: '@functionName'}],
        [/async\s+function(?=[\s(*]|$)/, {token: 'keyword-declaration', switchTo: '@functionName'}],
        [/async(?=[\s(]|$)/, {token: 'keyword-declaration', switchTo: '@functionParameters'}],
        [/(?=.)/, {token: '', switchTo: '@functionParameters'}]
      ],
      functionName: [
        {include: 'whitespace'},
        // [/(?=.*=>)/, {token: '', switchTo: '@functionParameters'}],
        [/@variable/, {token: 'function', switchTo: '@functionParameters'}],
        [/(?=\()/, {token: '', switchTo: '@functionParameters'}],
        [/\*/, 'flag'],
        [/(?=.)/, '', '@pop']
      ],
      functionParameters: [
        {include: 'whitespace'},
        [/\(/, {token: 'delimiter-bracket', switchTo: '@functionParameterBlock'}],
        [/@variable/, {token: 'identifier', switchTo: '@functionBlock'}],
        [/(?=.)/, '', '@pop']
      ],
      functionParameterBlock: [
        [/\)/, {token: 'delimiter-bracket', switchTo: '@functionBlock'}],
        {include: 'whitespace'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInParenthesis'},
        {include: 'blockKeywords'},
        [/@variable/, 'identifier'],
        {include: 'common'},
        [/(?=.)/, '', '@pop']
      ],
      functionArguments: [
        {include: 'whitespace'},
        {include: 'number'},
        [/\(/, 'delimiter-bracket'],
        [/\)/, 'delimiter-bracket', '@pop'],
        {include: 'whitespace'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        {include: 'matchBracketInParenthesis'},
        {include: 'blockKeywords'},
        [/@variable/, 'identifier'],
        {include: 'common'},
        [/(?=.)/, '', '@pop']
      ],
      functionBlock: [
        {include: 'whitespace'},
        [/\{/, {token: 'delimiter-bracket', switchTo: '@block'}],
        [/=>/, 'keyword-declaration'],
        [/(?=.)/, '', '@pop']
      ],
      classDeclaration: [
        [/class(?=[\s{]|$)/, 'keyword-declaration', '@className']
      ],
      className: [
        {include: 'whitespace'},
        [/extends(?!\w)/, {token: 'keyword-declaration', switchTo: '@classParent'}],
        [/@variable/, {token: 'class', switchTo: '@classExtension'}],
        [/\{/, {token: 'delimiter-bracket', switchTo: '@classBody'}],
        [/(?=.)/, '', '@pop']
      ],
      classExtension: [
        {include: 'whitespace'},
        [/\{/, {token: 'delimiter-bracket', switchTo: '@classBody'}],
        [/extends(?!\w)/, {token: 'keyword-declaration', switchTo: '@classParent'}],
        [/(?=.)/, '', '@pop']
      ],
      classParent: [
        {include: 'whitespace'},
        [
          /@variable/,
          {
            cases: {
              '@operations': {token: 'keyword-operation'},
              '@default': {token: 'property', switchTo: '@classParentLink'}
            }
          }
        ],
        [/\{/, {token: 'delimiter-bracket', switchTo: '@classParentInBrace'}],
        [/\[/, {token: 'delimiter-bracket', switchTo: '@classParentInSquare'}],
        [/\(/, {token: 'delimiter-bracket', switchTo: '@classParentInParenthesis'}],
        [/(?=.)/, '', '@pop']
      ],
      classParentLink: [
        {include: 'whitespace'},
        [/\{/, {token: 'delimiter-bracket', switchTo: '@classBody'}],
        [/\[/, {token: 'delimiter-bracket', next: '@array'}],
        [/\(/, {token: 'delimiter-bracket', next: '@functionArguments'}],
        [/\./, {token: 'delimiter', next: '@propertyName'}],
        [/(?=.)/, '', '@pop']
      ],
      classParentInBrace: [
        [/\}/, {token: 'delimiter-bracket', switchTo: '@classParentLink'}],
        {include: 'object'},
      ],
      classParentInSquare: [
        [/\]/, {token: 'delimiter-bracket', switchTo: '@classParentLink'}],
        {include: 'array'},
      ],
      classParentInParenthesis: [
        [/\)/, {token: 'delimiter-bracket', switchTo: '@classParentLink'}],
        {include: 'array'},
      ],
      classBody: [
        {include: 'whitespace'},
        // key (
        [
          /(@variable)(?=\s*\()/,
          [
            'function'
          ]
        ],
        // 'key' (
        [
          /'(?=[^']*'\s*\()/,
          'string-bracket',
          '@method_name_string_single'
        ],
        // "key" (
        [
          /"(?=[^']*"\s*\()/,
          'string-bracket',
          '@method_name_string_double'
        ],
        {include: 'classFunctionAssignment'},
        [
          /@symbols/,
          {
            cases: {
              '@operators': {token: 'operator', switchTo: '@classBodyExpression'},
              '$0==?': {token: 'operator', next: '@question'},
              '$0==#': 'flag',
              '@default': 'delimiter'
            }
          }
        ],
        {include: 'classPropertyKeywords'},
        {include: 'globalVariables'},
        {include: 'matchBracketInBrace'},
        {include: 'common'}
      ],
      classBodyExpression: [
        [/(?=^)|;/, {token: '', switchTo: '@classBody'}],
        [/(?:\{)/, {token: 'delimiter-bracket', next: '@object'}],
        {include: 'whitespace'},
        {include: 'functionAssignment'},
        {include: 'functionDeclaration'},
        {include: 'classDeclaration'},
        {include: 'functionCall'},
        // {include: 'classExpressionKeywords'},
        {include: 'globalVariables'},
        {include: 'matchBracketInBrace'},
        {include: 'common'},
      ],
      classFunctionAssignment: [
        [
          /(@variable)(\s*=\s*)(?=(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>)/,
          [
            'function',
            {token: 'operator', next: '@functionHead'}
          ]
        ],
        [
          /(?='[^']*'\s*=\s*(?:(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>))/,
          '',
          '@classFunctionAssignmentKey'
        ],
        [
          /(?="[^']*"\s*=\s*(?:(?:async\s+)?function(?:[\s(*]|$)|(?:async\s*)?(?:@variable|\([^)]*\))\s*=>))/,
          '',
          '@classFunctionAssignmentKey'
        ]
      ],
      classFunctionAssignmentKey: [
        {include: 'whitespace'},
        [/'/, 'string-bracket', '@method_name_string_single'],
        [/"/, 'string-bracket', '@method_name_string_double'],
        [/=/, {token: 'operator', switchTo: '@classFunctionAssignmentValue'}],
        ['', '', '@pop']
      ],
      classFunctionAssignmentValue: [
        {include: 'whitespace'},
        [/(?=async|function(?:[\s(*]|$)|(?:@variable|\([^)]*\))\s*=>)/, '', '@functionHead'],
        ['', '', '@pop']
      ],
      // (?:\s*\*)?
      // (?=\s*@variable\s*\{)
      // 'function', {token: '', next: }]
      blockKeywords: [
        // identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@declarations': 'keyword-declaration',
              '@transitivities': {token: 'keyword', next: '@operation'},
              '@operations': {token: 'keyword-operation', next: '@operation'},
              '@constants': 'keyword-constant',
              '@builtins': {
                cases: {
                  '$0==console': {token: 'keyword-builtin', next: '@consoleJoint'},
                  '@default': 'keyword-builtin'
                }
              },
              '@default': 'identifier'
            }
          }
        ]
      ],
      objectKeywords: [
        // identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              '@objectKeywords': 'keyword',
              '@objectDeclarations': 'keyword-declaration',
              '@operations': {token: 'keyword-operation', next: '@operation'},
              '@constants': 'keyword-constant',
              '@builtins': 'keyword-builtin',
              '@default': 'identifier'
            }
          }
        ]
      ],
      classPropertyKeywords: [
        // identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              '@objectDeclarations': 'keyword-declaration',
              '@default': 'property'
            }
          }
        ]
      ],
      // classExpressionKeywords: [
      //   // identifiers and keywords
      //   [
      //     /[a-z_$][\w$]*/,
      //     {
      //       cases: {
      //         '@objectKeywords': 'keyword',
      //         '@operations': {token: 'keyword-operation', next: '@operation'},
      //         '@constants': 'keyword-constant',
      //         '@builtins': 'keyword-builtin',
      //         '@default': 'identifier'
      //       }
      //     }
      //   ]
      // ],
      globalVariables: [
        [
          /([A-Z][\w$]*\s*)([.[])?/,
          {
            cases: {
              '@constants': 'keyword-constant',
              '$2~[.[]': [
                {
                  cases: {
                    '@globalHighlights': 'identifier-global',
                    '@default': 'identifier'
                  }
                },
                {
                  cases: {
                    '$2==[': {token: 'delimiter', next: '@array'},
                    '$1@specialObjects': {
                      cases: {
                        '$1==Math': {token: 'delimiter', next: '@mathProperties'},
                        '$1==Object': {token: 'delimiter', next: '@objectProperties'},
                        '$1==Array': {token: 'delimiter', next: '@arrayProperties'},
                        '$1==JSON': {token: 'delimiter', next: '@jsonProperties'},
                        '$1==Number': {token: 'delimiter', next: '@numberProperties'},
                        '$1==String': {token: 'delimiter', next: '@stringProperties'},
                        '@default': {token: 'delimiter', next: '@propertyName'}
                      }
                    },
                    '@default': {token: 'delimiter', next: '@propertyName'}
                  }
                }
              ],
              '@default': 'identifier'
            }
          }
        ]
      ],
      number: [
        [/(@digits)[eE]([\-+]?(@digits))?/, 'number'],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, 'number'],
        [/0[xX](@hexdigits)n?/, 'number'],
        [/0[oO]?(@octaldigits)n?/, 'number'],
        [/0[bB](@binarydigits)n?/, 'number'],
        [/(@digits)n?/, 'number'],
      ],
      string: [
        [/'(?:[^'\\]|\\.)*$/, 'string-invalid'],
        [/"(?:[^"\\]|\\.)*$/, 'string-invalid'],
        [/'/, 'string-bracket', '@string_single'],
        [/"/, 'string-bracket', '@string_double'],
        [/`/, 'string-bracket', '@string_backtick']
      ],
      common: [
        // [/[A-Z][\w\$]*/, 'identifier'],
        // whitespace
        // {include: '@whitespace'},
        // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
        [
          /\/(?=([^\\]|\\.)+\/([dgimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,
          {token: 'regexp-bracket', bracket: '@open', next: '@regexp'}
        ],
        // delimiters and operators
        // [/[<>](?!@symbols)/, '@brackets'],
        [/!(?=([^=]|$))/, 'operator'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': {token: 'operator', next: '@operation'},
              '$0==?': {token: 'operator', next: '@question'},
              '$0==#': {token: 'flag', next: '@privateProperty'},
              '@default': 'delimiter'
            }
          }
        ],
        // numbers
        {include: 'number'},
        // delimiter: after number because of .\d floats
        // [/\./, 'delimiter', '@propertyName'],
        [
          /\.\.\.|[.,;]/,
          {
            cases: {
              '$0==.': {token: 'delimiter', next: '@propertyName'},
              '$0==...': {token: 'operator'},
              '@default': {token: 'delimiter'}
            }
          }
        ],
        // strings
        {include: 'string'},
        [/[\p{L}$_\d]+/u, 'identifier'],
      ],
      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/\/\*/, 'comment', '@blockComment'],
        [/(?=\/\/.*$)/, '', '@lineComment']
      ],
      lineComment: [
        [/(\/\/:)(.*$)/,
          [
            // 第二个有可能因空值而不执行因此把@pop放在头部
            {token: 'comment', next: '@pop'},
            'class'
          ]
        ],
        [/\/\/.*$/, 'comment', '@pop']
      ],
      blockComment: [
        [/[^*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/\*/, 'comment']
      ],
      privateProperty: [
        {include: 'whitespace'},
        [/@variable/, 'property'],
        ['', '', '@pop'],
      ],
      // We match regular expression quite precisely
      regexp: [
        [
          /\{(?=\d+(?:,\d*)?\})/,
          'regexp-escape-control',
          '@regexrepeat'
        ],
        [
          /(\[)(\^?)(?=(?:[^\\]|\\.)+)/,
          ['regexp-escape-control', {token: 'regexp-escape-control', next: '@regexrange'}]
        ],
        [/(\()(\?:|\?=|\?!)/, ['regexp-escape-control', 'regexp-escape-control']],
        [/[\^\$]/, 'regexp-escape-end'],
        // 这一步好像是多余的
        // [/[()]/, 'regexp-escape-control'],
        [/@regexpctl/, 'regexp-escape-control'],
        [/[^\\\/]/, 'regexp'],
        [/@regexpesc/, 'regexp-escape'],
        [/\\\./, 'regexp-invalid'],
        [/(\/)([dgimsuy]*)/, [{token: 'regexp-bracket', bracket: '@close', next: '@pop'}, 'regexp-flag']]
      ],
      regexrepeat: [
        [/\d+/, 'regexp-range'],
        [/,/, 'regexp-escape-control'],
        [/\}/, 'regexp-escape-control', '@pop']
      ],
      regexrange: [
        [/-/, 'regexp-escape-control'],
        [/@regexpesc/, 'regexp-escape'],
        [/[^\]]/, 'regexp-range'],
        [
          /\]/,
          {
            token: 'regexp-escape-control',
            next: '@pop',
            bracket: '@close'
          }
        ]
      ],
      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string-escape'],
        [/'/, 'string-bracket', '@pop']
      ],
      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string-escape'],
        [/"/, 'string-bracket', '@pop']
      ],
      string_backtick: [
        [/\$\{/, {token: 'delimiter-bracket', next: '@bracketCounting'}],
        [/[^\\`$]+|\$/, 'string'],
        [/\\./, 'string-escape'],
        [/`/, 'string-bracket', '@pop']
      ],
      bracketCounting: [
        // push的堆栈上限是100
        // 直接指定则没有限制
        [/\{/, 'delimiter-bracket', '@push'],
        [/\}/, 'delimiter-bracket', '@pop'],
        {include: 'block'}
      ],
      method_name_string_single: [
        [/[^\\']+/, 'function'],
        [/\\./, 'string-escape'],
        [/'/, 'string-bracket', '@pop']
      ],
      method_name_string_double: [
        [/[^\\"]+/, 'function'],
        [/\\./, 'string-escape'],
        [/"/, 'string-bracket', '@pop']
      ],
    }
  }
})