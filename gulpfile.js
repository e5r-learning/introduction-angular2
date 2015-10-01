var gulp = require('gulp'),		
    tsc = require('gulp-typescript'),
	SERVER_PORT = 5000;

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

// npm install serve-static@1.10.0 --save-dev
gulp.task('serve-node', ['default'], function() {
	var serveStatic = require('serve-static'),
		execAsync = require('child_process').exec,
	    http = require('http'),
		app = serveStatic('./'),
		server = http.createServer(function(req, res) {
			app(req, res, function(){});
		});

	var serverUrl = 'http://localhost:' + SERVER_PORT;
	
	console.log('>> Running web server...');
	console.log('   - Url:', serverUrl);

	execAsync('start ' + serverUrl);
		
	server.listen(SERVER_PORT);
});

gulp.task('serve-net', ['default'], function(cb) {
	var fs = require('fs'),
		os = require('os'),
		path = require('path'),
		execAsync = require('child_process').exec,
		spawn = require('child_process').spawn,
		exec = require('child_process').spawnSync;
		
	if(os.platform() != 'win32'){
		console.log('#TODO: Add suport of UNIX platforms')
		throw new Error('gulp serve-net run only in Windows platform');
	}
	
	var dnvmExecFile = path.resolve(process.env.USERPROFILE, '.dnx', 'bin', 'dnvm.cmd');
	
	console.log(dnvmExecFile);
	
	console.log('>> Checking DNVM...');
	
	if(!fs.existsSync(dnvmExecFile)) {
		console.log('>> Installing DNVM...');
		
		var installDnvm = exec('cmd',[
			'/c', 'powershell',
			'-NoProfile',
			'-ExecutionPolicy',
			'unrestricted',
			'-Command',
			'&{$Branch="dev";$wc=New-Object System.Net.WebClient;$wc.Proxy=[System.Net.WebRequest]::DefaultWebProxy;$wc.Proxy.Credentials=[System.Net.CredentialCache]::DefaultNetworkCredentials;Invoke-Expression ($wc.DownloadString("https://raw.githubusercontent.com/aspnet/Home/dev/dnvminstall.ps1"))}'
		]);
		
		if(installDnvm.error) {
			console.log('   Error installing DNVM:', installDnvm.error);
			cb(installDnvm.error);
			return;
		}
	}
	
	var globalJson = JSON.parse(fs.readFileSync('global.json')),
		
		netVersion = globalJson.sdk.version,
		netRuntime = globalJson.sdk.runtime,
		netArch = globalJson.sdk.architecture;
	
	console.log('>> Installing DNX...');
	console.log('   - Version:', netVersion);
	console.log('   - Runtime:', netRuntime);
	console.log('   - Architecture:', netArch);
	
	var installDnx = exec('cmd', [
		'/c', dnvmExecFile,
		'install', netVersion,
		'-r', netRuntime,
		'-arch', netArch
	]);
	
	if(installDnx.error) {
		console.log('   Error installing DNX:', installDnx.error);
		cb(installDnx.error);
		return;
	}
	
	console.log('>> DNU restoring...');
	var restoreDnu = exec('cmd', [
		'/c', dnvmExecFile,
		'exec', netVersion, '-r', netRuntime, '-arch', netArch,
		'dnu', 'restore'
	]);
	
	if(restoreDnu.error) {
		console.log('   Error DNU restoring:', restoreDnu.error);
		cb(restoreDnu.error);
		return;
	}
	
	var serverUrl = 'http://localhost:' + SERVER_PORT;
	
	console.log('>> Running web server...');
	console.log('   - Url:', serverUrl);

	execAsync('start ' + serverUrl);
	
	var webServer = spawn('cmd', [
		'/c', dnvmExecFile,
		'exec', netVersion, '-r', netRuntime, '-arch', netArch,
		'dnx', 'web',
		'--server.urls', serverUrl
	]);
	
	webServer.stdout.on('data', function(data) {
		console.log(data.toString());
	});
	
	webServer.on('error', function(error) {
		console.log('   Error running web server:', error);
		cb(error);
	});

});

gulp.watch('app.ts', ['default']);