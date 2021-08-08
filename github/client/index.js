(function () {
  module.exports = Object.assign(require('./octokit'), {
    custom: require('./custom'),
    graphQL: require('./graphql'),
    shell: require('./shell'),
  });
}.call(this));
