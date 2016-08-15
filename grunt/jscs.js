// Make sure code styles are up to par and there are no obvious mistakes
var files = [
  'public/client/**/*.js',
  'public/host/**/*.js',
  'class/**/*.js',
  '*.js',
  'grunt/*.js',
];
module.exports = {
  all: {
    src: files,
    options: {
      config: '.jscrc',
    },
  },
};