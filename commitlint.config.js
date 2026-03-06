module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'detector',
        'generator',
        'docker',
        'github',
        'proxy',
        'nlp',
        'prompt',
        'utils',
        'cli',
        'templates',
        'config',
        'docs'
      ]
    },
    'subject-case': [0]
  }
};
