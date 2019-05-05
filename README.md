# Homebrew yard

<p align="center">
  <a href="https://github.com/prettier/prettier#readme">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"></a>
  <a href="https://conventionalcommits.org">
    <img alt="Conventional Commits: 1.0.0" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square"></a>
</p>




# Configuration

[convict](https://www.npmjs.com/package/convict) and [dotenv](https://www.npmjs.com/package/dotenv) are used to create the configuration. The manual configuration is done by a `.env` file in the root that can declare environment variables. The schema for these environment variables, along with the default values, can be found in `src/config/config.ts`. Note that not all variables need to be declared but some are mandatory. In general, declare at least the variables of which the default is empty.

In short, take these steps to get started with the configuration.

1. Create a `.env` file in the root directory of this project.
2. Declare the variable(s) with a single variable per line, e.g. `MY_VAR=example`.



# To do

- [ ] Update create-formula with an option to keep the bottle information.
- [ ] Throw an error when the required variables are not configured.
