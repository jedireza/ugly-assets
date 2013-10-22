#!/usr/bin/env node
'use strict';

var watchr = require('watchr'),
    path = require('path'),
    findit = require('findit2'),
    fs = require('fs'),
    cp = require('child_process');

var correctPath = function(path) {
  if (/^win/.test(process.platform)) {
    return path.replace(/\//g, '\\');
  }
  return path;
};

var createCommand = function(command) {
  if (/^win/.test(process.platform)) {
    correctPath(command) + '.cmd';
  }
  return command;
};

var jshintrc;
var jshintpath = correctPath(process.cwd() + '/.jshintrc');
fs.exists(jshintpath, function(exists) {
  if (exists) {
    jshintrc = jshintpath;
  }
});

watchr.watch({
  paths: [process.cwd()],
  ignoreCustomPatterns: /\.min\.js|\.min\.css/i,
  listener: function(changeType, filePath, fileCurrentStat, filePreviousStat){
    if ('delete' === changeType) { return; }
    console.log('UGLY {*} Change detected: '+ filePath);
    build(filePath);
  }
});

var build = function(filePath) {
  if (/\.less$/.test(filePath)) {
    lintLESS(filePath);
    compileLESS(filePath);
  }
  
  if (/\.js$/.test(filePath)) {
    lintJS(filePath);
    compileJS(filePath);
  }
};

var lintLESS = function(filePath, cb) {
  var lesscmd = cp.spawn(createCommand(__dirname +'/node_modules/.bin/recess'), [filePath, '--noSummary', '--strictPropertyOrder', 'false']);
  lesscmd.stdout.on('data', function(d) { process.stdout.write(d); });
  lesscmd.stderr.on('data', function(d) { process.stderr.write(d); });
  lesscmd.on('close', function (code) {
    console.log('UGLY [✔] Linted: '+ filePath);
    if (cb) { cb(); }
  });
};

var compileLESS = function(filePath) {
  var args = ['--compress', filePath];
  
  var basePath = path.dirname(filePath) +'/';
  var lessBaseName = path.basename(filePath, '.less');
  var lessMinName = lessBaseName + '.min.css';
  var lessMinPath = basePath + lessMinName;
  
  var cssStream = fs.createWriteStream(lessMinPath);
  var lesscmd = cp.spawn(createCommand(__dirname +'/node_modules/.bin/recess'), args);
  lesscmd.stdout.on('data', function(d) { cssStream.write(d); });
  lesscmd.stderr.on('data', function(d) { process.stderr.write(d); });
  lesscmd.on('close', function (code) {
    cssStream.end();
    console.log('UGLY [✔] Compiled: '+ filePath +' > '+ lessMinName);
  });
};

//a function that lints javascript files
var lintJS = function(filePath, cb) {
  var args = [filePath];
  if (jshintrc) {
    args.push('--config', jshintrc)
  }
  var hintcmd = cp.spawn(createCommand(__dirname +'/node_modules/.bin/jshint'), args);
  hintcmd.stdout.on('data', function(d) { process.stdout.write(d); });
  hintcmd.stderr.on('data', function(d) { process.stderr.write(d); });
  hintcmd.on('close', function (code) {
    console.log('UGLY [✔] Linted: '+ filePath);
    if (cb) { cb(); }
  });
};

var compileJS = function(filePath) {
  var basePath = path.dirname(filePath) +'/';
  var jsBaseName = path.basename(filePath, '.js');
  var jsMinName = jsBaseName + '.min.js';
  var jsMinPath = basePath + jsMinName;
  var jsMapName = jsMinName + '.map';
  var jsMapPath = basePath + jsMapName;
  
  var args = [
    filePath,
    '--output', jsMinPath,
    '--source-map', jsMapPath,
    '--source-map-root', '/',
    '--prefix', '1',
    '--source-map-url', jsMapName
  ];
  
  var uglycmd = cp.spawn(createCommand(__dirname +'/node_modules/.bin/uglifyjs'), args);
  uglycmd.stdout.on('data', function(d) { process.stdout.write(d); });
  uglycmd.stderr.on('data', function(d) { process.stderr.write(d); });
  uglycmd.on('close', function (code) {
    console.log('UGLY [✔] Compiled: '+ filePath +' > '+ jsMinName);
  });
};
