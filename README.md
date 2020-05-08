# :muscle: codingame-spring-challenge-2020

> Typescript solutuion for CodinGame Spring Challenge 2020

## Installation
1. Run `yarn install` in the project folder

## Usage

Run either `yarn start` or `yarn run build` to generate the output file, then start the CodinGame Sync tool and choose to sync the `dist/index.js` file.

### Commands

- `yarn start`: build your code in watch mode (it will automatically recompile on change).
  Note that in this mode code size optimizations are NOT performed, use `yarn run build` for that.
- `yarn run build`: build your code once, with tree-shaking and minification
- `yarn run test`: run unit tests once
- `yarn run test:watch`: run unit tests in watch mode
- `yarn run prettify`: reformat all your code automatically

### VSCode integrations

All NPM scripts are mapped to VSCode tasks, and the build shortcut is mapped to the `yarn run build` command.

A launch configuration is also ready-to-use to debug your tests with breakpoints support within VSCode.

## Features

- Each Pac tries to go for the closest most valuable Pellet

## Known Issues

- Pacs end up going for the same Pellets
- Pacs get stuck on each other
- Pacs don't handle there being no Pellets in line of sight

## TODO List

- Send Pacs for different Pellets
- Add Rock, Paper, Scisors mechanics
