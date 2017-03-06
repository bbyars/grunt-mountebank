# grunt-mountebank

[![Greenkeeper badge](https://badges.greenkeeper.io/bbyars/grunt-mountebank.svg)](https://greenkeeper.io/)

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
      path: 'node_modules/.bin/mb',
      pathEnvironmentVariable: 'MB_EXECUTABLE'
    },
    start: ['--port', 2525, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
    restart: ['--port', 2525, '--allowInjection', '--mock', '--debug', '--pidfile', 'mb-grunt.pid'],
    stop: ['--pidfile', 'mb-grunt.pid']
  },
});
```

If you leave off the options, the plugin assumes the path to `mb` is simply `mb` (as it is if you
`npm install -g mountebank`).  The `pathEnvironmentVariable` allows dynamic substitution of the
path to support niche cases where you won't know the path until other tasks run (the mountebank
build uses this to test various packaging options).  You probably won't need it, but if both
`path` and `pathEnvironmentVariable` are set, `pathEnvironmentVariable` takes precedence.

The `start`, `stop`, and `restart` target arrays define the [command
line arguments](http://www.mbtest.org/docs/commandLine) passed to each of those commands.

Because you likely want to guarantee that you stop mountebank even if tests that depend on it fail,
this plugin also adds a `try`, `finally`, and `checkForErrors` task.  An example test run might look
something like this:

```js
grunt.registerTask('test', ['mb:start', 'try', 'mochaTest', 'finally', 'mb:stop', 'checkForErrors']);
```

The `try` task collects failures but instructs grunt to continue to the next task.  The `finally` task
restores the fail-on-error behavior and helps guarantee that the next task runs.  `checkForErrors`
inspects the failures collected during the `try` section and fails the build if necessary.

## mountebank Initialization

As of mountebank v1.4.3, this task guarantees that `mb` is fully initialized before returning.
Prior to mountebank v1.4.3, you may have to add a small delay in the next task if it expects
`mb` to be initialized.  This is particularly true if you use the `--configfile` options.
