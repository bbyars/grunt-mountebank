# grunt-mountebank

[mountebank](http://www.mbtest.org) lifecycle management for grunt

## Getting Started

This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out
the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains
how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as
install and use Grunt plugins. Once you're familiar with that process, you
may install this plugin with this command:

```shell
npm install grunt-mountebank --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mountebank');
```

## Grunt Configuration

In your project's Gruntfile, add a section named `mb` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  mb: {
    options: {
      path: 'node_modules/.bin/mb'
    },
    start: ['--port', 2525, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
    restart: ['--port', 2525, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
    stop: ['--pidfile', 'mb-grunt.pid']
  },
});
```

If you leave off the options, the plugin assumes the path to `mb` is simply `mb` (as it is if you
`npm install -g mountebank`).  The `start`, `stop`, and `restart` target arrays define the command
line arguments passed to each of those commands.

Because you likely want to guarantee that you stop mountebank even if tests that depend on it fail,
this plugin also adds a `try`, `finally`, and `checkForErrors` task.  An example test run might look
something like this:

```js
grunt.registerTask('test', ['mb:start', 'try', 'mochaTest', 'finally', 'mb:stop', 'checkForErrors']);
```

The `try` task collects failures but instructs grunt to continue to the next task.  The `finally` task
restores the fail-on-error behavior and helps guarantee that the next task runs.  `checkForErrors`
inspects the failures collected during the `try` section and fails the build if necessary.
