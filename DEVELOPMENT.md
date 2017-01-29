# `j2c` development

If you want to install `j2c` to work on it, first fork the repo and clone the fork locally

```BASH
$ git clone https://github.com/yourAccount/j2c
```

Then add `j2css/j2c` as a remote for pulling, then create your work branch. My advice is to never work on the master branch directly as it will make it easier to pull remote changes and handle merge conflicts (unless you know your way around git, then do whatever you like).

```BASH
$ cd j2c
$ git remote add j2css https://github.com/j2css/j2c.git
$ git checkout -b your-work-branch-here
```

Now install the dependencies and the plugin dependencies ([yarn](https://yarnpkg.com/) is recommended but you can use NPM as well):

```BASH
$ yarn # resp. npm install
$ yarn run install-plugins # resp. npm run install-plugins
```

Now run the full QA suite to verify that everything works fine.

```BASH
$ yarn run all # runs `lint`, `build`, `cover` (which runs the tests) and `check-coverage`
```

While developing, you'll probably want to use `yarn run dev` instead of `all`. It only runs the `build` and `test` tasks.

While `yarn run build` will only build the core, the `test`, `lint` and `cover` tasks work on the whole project, plugins included. This ensures that changes in the core do not break plugins.

## working on a plugin.

The plugins are set up in distinct folders with their own `package.json` and dedicated `build` and `dev` scripts, and they rely on the main tasks to run the tests, linting  and coverage.

When working in a plugin directory the `yarn run go x` command (or `yarn go x`) will be forwarded to the scripts at the `j2c` root (it literally calls `cd ../.. && yarn run x`).

The test suites of the plugins depend on the `j2c` version at the root of the directory, not on the `npm` dependency.

## rebasing on top of upstream changes

If you want to submit a PR but other changes that were committed in the mean time, you can rebase your changes on top of them.

```BASH
$ git checkout master # resp. your target branch
$ git pull --rebase j2css # the --rebase option gets rids of ugly merge commits
$ git checkout your-work-branch-here
$ git rebase master
```

If there are conflicts:

1. resolve potential conflicts in your text editor (identify the problem files using `git diff` or `git status`)
2. then run

```BASH
$ git add previously-conflictual-file
$ git rebase continue
```
rinse and repeat until there are no conflicts anymore.