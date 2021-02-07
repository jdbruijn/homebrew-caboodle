# Documentation

## CLI

- `--formulae, -f` to specify the formula to create using a Glob pattern, defaults to all formulae (`*`).
  - `cmake*` to create all formulae starting with `cmake`.
  - `cmake@3.15.*` to create all formulae starting with `cmake@3.15.`.

### `create` command

Create formulae from the formula configuration.

- `--update, -u` to also update existing formulae, keeping their bottle information.

### `update` command

Update existing formulae from their formula configuration.

- Basically create formulae but keeping their bottle information.
- `--check` to only check whether formulae can be updated.

### `list` command

List formulae.

- `--existing, -e` to list all existing formulae (default).
- `--create, -c` to list formulae that can be created.
- `--update, -u` to list formulae that have updates.
- `--changed <startRevision> <endRevision>` to list changed formulae in Git.
  `git -C repository diff-tree -r --name-only --diff-filter=A startRevision endRevision ./Formula`

---

First of all, test what is described in the [Homebrew tap with bottles uploaded to GitHub Releases](https://brew.sh/2020/11/18/homebrew-tap-with-bottles-uploaded-to-github-releases/) article. I think that will get me 80 percent of the way. Some things I'd like to look at:

- How are multiple formula changes in one commit handled?
  In my setup, it is very likely that I create one change to update all `cmake@...` formulae. I expect all formulae will be build in a single workflow, thus taking a very long time. If that is indeed the case, I can either look at whether I can create a matrix in the given workflow setup or to create a whole bunch of custom code to split the build up in a matrix.

  - In general, works a treat!
  - Multiple changes are built in a single workflow run. For example see https://github.com/jdbruijn/homebrew-test/actions/runs/544970463.
    This is in the `brew test-bot --only-formulae` step.
  - We can run the formulae separately in a matrix. See https://github.com/jdbruijn/homebrew-test/actions/runs/545185963.

- CMake build workflow succeeding (with manual `curl` install).
  https://github.com/jdbruijn/homebrew-test/actions/runs/545016820
- Without the manual `curl` it also succeeds.
  https://github.com/jdbruijn/homebrew-test/actions/runs/545085828
- With _old_ CMake install file that is not compatible with Linux install.
  https://github.com/jdbruijn/homebrew-test/actions/runs/545131997

## Versioning

- The `version` of each formula tracks the version of `homebrew-caboodle`.
  - **Pros**
    - Easily trackable what version of the formula is installed.
  - **Cons**
    - Users will get a lot of updates if the formula version is bumped on each release.
- The `version` of each formula tracks the version of `homebrew-caboodle`, but is only updated when the formula is changed.
  - **Pros**
    - Users will only get an update if the formula actually changes.
  - **Cons**
    - _Hard(er) to track down what version the formula was actually built on?_

---

## Get changed formulae

- `--diff-filter`: `A` for added, `M` for modified and `D` for deleted.

```shell
git -C repository diff-tree -r --name-only --diff-filter=A start_revision end_revision ./Formula
```

- https://github.com/Homebrew/homebrew-test-bot/blob/9c1a7af70f007d689e7c3bf40ccdb31e5760a660/lib/tests/formulae.rb#L149-L157
- https://github.com/Homebrew/homebrew-test-bot/blob/9c1a7af70f007d689e7c3bf40ccdb31e5760a660/lib/tests/formulae.rb#L52

## Check a formula

Audit a formula using the `brew audit` command.

```shell
$ brew audit --display-cop-names --formula --online --strict ./Formula/cmake@3.15.5.rb
```

---

# Stages

Source: [`ladilsas/homebrew-greetings](https://github.com/ladislas/homebrew-greetings).
Based on the [`Homebrew tap-new command`](https://github.com/Homebrew/brew/blob/master/Library/Homebrew/dev-cmd/tap-new.rb).

# Stage 1 - Testing formulae on `master`

Verify the `main` branch is tappable.

- `brew test-bot --only-cleanup-before`
- `brew test-bot --only-setup`
- `brew test-bot --only-tap-syntax`
