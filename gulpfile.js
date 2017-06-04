'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const cssFiles = '_sass/**/*.?(s)css';

gulp.task('sass', () => {
    gulp.src(cssFiles)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest('./css/'));
});

gulp.task('watch', function () {
    gulp.watch('_sass/**/*.scss', ['sass']);
});
