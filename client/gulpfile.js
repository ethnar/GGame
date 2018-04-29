'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var debug = require('gulp-debug');

gulp.task('sass', function () {
    return gulp
        .src([
            './**/*.scss',
            '!./node_modules/**/*.scss'
        ])
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./_css'));
});

gulp.task('sass:watch', ['sass'], function () {
    gulp.watch('./**/*.scss', ['sass']);
});
