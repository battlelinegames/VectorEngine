const gulp = require('gulp');
const ts = require('gulp-typescript');
const reload = require('gulp-livereload');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const wait = require('gulp-wait');
const nunjucks = require('gulp-nunjucks-render');
const shell = require('gulp-shell');
const copy = require('gulp-copy');

const pump = require('pump');
const uglify = require('gulp-uglify');

const imagemin = require('gulp-imagemin');
const pngmin = require('imagemin-pngquant');

const DIST_PATH = 'precompress'; //'dist';
const SCRIPT_PATH = 'dev/**/*.ts';
const HTML_PATH = 'dev/**/*.html';
const IMG_PATH = 'dev/images/**/*.{png,jpg,jpeg,svg,gif}';

gulp.task( 'scripts', function() {
    console.log("process scripts");
    return gulp.src([SCRIPT_PATH, "!dev/interface/*.ts"])
            .pipe(sourcemaps.init())
            .pipe(ts({
                noImplicitAny: true,
                target: "es5",
                outFile: 'soundsynth.js'
                }))
            // THIS NEEDS TO BE WRITTEN AFTER PRE-PROCESSING, BUT BEFORE DESTINATION SET
            .pipe( sourcemaps.write() )
            .pipe(gulp.dest(DIST_PATH))
            .pipe(reload());
});

gulp.task( 'interface', function() {
    console.log("process interface");
    return gulp.src(SCRIPT_PATH)
            .pipe(sourcemaps.init())
            .pipe(ts({
                noImplicitAny: true,
                target: "es5",
                outFile: 'interface.js'
                }))
            // THIS NEEDS TO BE WRITTEN AFTER PRE-PROCESSING, BUT BEFORE DESTINATION SET
            .pipe( sourcemaps.write() )
            .pipe(gulp.dest(DIST_PATH))
            .pipe(reload());
});

gulp.task( 'images', function() {
    console.log("images processing");
    return gulp.src(IMG_PATH)
            .pipe(imagemin(
                [
                    imagemin.optipng(),
                    pngmin()
                ]
            ))
            .pipe(gulp.dest(DIST_PATH + "/images"));
});

gulp.task( 'njk', function() {
    return gulp.src(HTML_PATH)

    .pipe(nunjucks({
        path: [HTML_PATH]
      }))
      .pipe(gulp.dest("dist"));
});

gulp.task( 'engine', function() {

    gulp.src('../enginegl/engine.js')
    .pipe(gulp.dest('./dist/'));
//    gulp.src('../enginegl/a-engine.d.ts')
//    .pipe(gulp.dest('./dist/'));
//    gulp.src('../enginegl/engine.js')
//    .pipe(gulp.dest('./dev/'));
    gulp.src('../enginegl/a-engine.d.ts')
    .pipe(gulp.dest('./dev/'));
});

gulp.task( 'watch', function() {
    console.log("watching for files");
    // START THE SERVER
    require('./server.js');
    reload.listen();
    //'engine', 
    gulp.watch(SCRIPT_PATH, ['scripts', 'interface', 'njk', 'compress']); 
//    gulp.watch(HTML_PATH, 'njk');
});

gulp.task('compress', function () {
    console.log("COMPRESS!!!")
    pump([
          gulp.src('precompress/*.js'),
          uglify(),
          gulp.dest('dist')
      ]
    );
  });
