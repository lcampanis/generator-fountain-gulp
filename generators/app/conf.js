/* eslint prefer-spread: 0 */
'use strict';

const _ = require('lodash');

function series() {
  const array = [];
  array.push.apply(array, arguments);
  array.type = 'series';
  return array;
}

function parallel() {
  const array = [];
  array.push.apply(array, arguments);
  array.type = 'parallel';
  return array;
}

function gulpTasksToString(tasks) {
  let result;
  if (_.isArray(tasks)) {
    result = `gulp.${tasks.type}(${tasks.map(gulpTasksToString).join(', ')})`;
  } else {
    result = `'${tasks}'`;
  }
  return result;
}

module.exports = function gulpfileConf(generatorProps) {
  const props = Object.assign({}, generatorProps);

  if (props.modules === 'webpack') {
    props.buildTask = series(parallel('other', 'webpack:dist'));
  } else if (props.modules === 'inject') {
    props.buildTask = series(parallel('inject', 'other'), 'build');
  } else if (props.modules === 'systemjs') {
    props.buildTask = series(parallel('systemjs', 'systemjs:html', 'styles', 'other'), 'build');
  }

  if (props.framework === 'angular1') {
    props.buildTask.unshift('partials');
  }

  if (props.modules === 'inject') {
    props.serveTask = series('inject', 'watch', 'browsersync');
  } else if (props.modules === 'webpack') {
    props.serveTask = series('webpack:watch', 'watch', 'browsersync');
  } else if (props.modules === 'systemjs') {
    props.serveTask = series(parallel('scripts', 'styles'), 'watch', 'browsersync');
  }

  if (props.modules === 'inject') {
    props.testTask = series('scripts', 'karma:single-run');
    props.testAutoTask = series('watch', 'karma:auto-run');
  } else {
    props.testTask = series('karma:single-run');
    props.testAutoTask = series('karma:auto-run');
  }

  ['buildTask', 'serveTask', 'testTask', 'testAutoTask'].forEach(task => {
    props[task] = gulpTasksToString(props[task]);
  });

  return props;
};
