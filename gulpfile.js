var gulp = require('gulp'),
    tsc = require('gulp-typescript');

gulp.task('copy-libs', function() {
	gulp
	.src([
		'node_modules/traceur/bin/traceur-runtime.js',
		'node_modules/systemjs/dist/system.js',
		'node_modules/angular2/bundles/angular2.js'
	])
	.pipe(gulp.dest('./lib'));
});

gulp.task('default', ['copy-libs'], function() {
	gulp
	.src('app.ts')
	.pipe(tsc({
		module: "commonjs",
		target: "es5",
		"emitDecoratorMetadata": true,
		"experimentalDecorators": true
	}))
	.pipe(gulp.dest('./'));
});

gulp.watch('app.ts', ['default']);