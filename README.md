ugly-assets
===========

Watch, lint and build your `.js` and `.less` assets.

### Installation

```
$ npm install ugly-assets -g
```

### Usage

Simply navigate to a directory and run `$ ugly-assets`. Then whenever a `.js` or `.less` file changes `ugly-assets` will display linting information in the terminal and also create a compressed `.min.js` or `.min.css` version respectuflly.

### JSHint Settings

If there is a `.jshintrc` file in the current working directory `ugly-assets` will use it when linting `.js` files.
