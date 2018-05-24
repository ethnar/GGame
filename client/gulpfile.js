'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const debug = require('gulp-debug');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
    return gulp
        .src([
            './variables.scss',
            './**/*.scss',
            '!./node_modules/**/*.scss'
        ])
        .pipe(concat('all.scss'))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./_css'));
});

gulp.task('sass:watch', ['sass'], function () {
    gulp.watch('./**/*.scss', ['sass']);
});
