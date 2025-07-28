module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'script',
  },
  globals: {
    // WebGL and browser APIs
    WebGL2RenderingContext: 'readonly',
    WebGLRenderingContext: 'readonly',
    AudioContext: 'readonly',
    webkitAudioContext: 'readonly',
    
    // Application globals (from script.js)
    nodes: 'writable',
    connections: 'writable',
    gl: 'writable',
    canvas: 'writable',
    selectedNode: 'writable',
    cursorComponents: 'writable',
    
    // Test framework globals
    runAllTests: 'readonly',
    runTest: 'readonly',
    createTestScenario: 'readonly',
    TestRunner: 'readonly',
    
    // Layout library globals
    ELK: 'readonly',
    dagre: 'readonly',
    
    // Logger
    Logger: 'readonly',
  },
  rules: {
    // Code quality rules
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console for debugging
    'no-debugger': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Security rules
    'no-script-url': 'error',
    'no-inline-comments': 'off',
    
    // Style rules (warnings only)
    'indent': ['warn', 2],
    'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    
    // WebGL specific
    'no-magic-numbers': 'off', // WebGL has many magic numbers
    'max-len': ['warn', { code: 120 }],
    
    // Allow function hoisting (common in vanilla JS)
    'no-use-before-define': ['error', { functions: false }],
    
    // Performance
    'no-loop-func': 'warn',
    'no-extend-native': 'error',
    
    // Browser compatibility
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        node: true,
      },
      globals: {
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    {
      files: ['deploy-docs.js'],
      env: {
        node: true,
      },
    },
  ],
};