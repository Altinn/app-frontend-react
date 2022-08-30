## Shared tests for layout expressions

These tests are defined in platform-independent JSON files (the format of which is
described in the `TestDescription` type in `index.test.ts`). The goal of these tests
is to provide a cross-platform test suite which runs the same tests on both the
frontend and backend implementations of layout expressions.

For this reason, it is very important to sync any changes in these tests with the
corresponding test collection on the backend (and port any changes from there
over here).

These tests are duplicated in [TODO: INSERT LINK TO OTHER REPO](https://github.com/Altinn).
