import {Manager} from '@shockpkg/core';
import {
	Plist,
	ValueDict,
	ValueString,
	ValueBoolean
} from '@shockpkg/plist-dom';
import {
	BundleWindows32,
	BundleMacApp,
	BundleLinux32,
	BundleLinux64,
	loader
} from '@shockpkg/swf-projector';

import {
	appName,
	appDomain,
	version,
	author,
	copyright,
	appFile,
	appDmgTitle,
	versionShort,
	distName
} from './util/meta.mjs';
import {docs} from './util/doc.mjs';
import {makeZip, makeTgz, makeExe, makeDmg} from './util/dist.mjs';
import {copyFile, files, outputFile, remove} from './util/fs.mjs';

async function * resources() {
	for await (const [a, r, f] of files('original/files/2006')) {
		if (/\.(swf|xml|txt)$/i.test(f) && f !== 'detect.swf') {
			yield [r, a];
		}
	}
	for await (const [a, r, f] of files('src/shared', false)) {
		if (/\.swf$/i.test(f)) {
			yield [r, a];
		}
	}
}

async function bundle(bundle, pkg, delay = false) {
	const swfv = 8;
	const [w, h] = [760, 389];
	const fps = 25;
	const bg = 0xFFFFFF;
	const url = 'voyanuianimations.swf';
	await bundle.withData(
		await (new Manager()).with(m => m.packageInstallFile(pkg)),
		loader(swfv, w, h, fps, bg, url, delay ? Math.round(fps / 2) : 0),
		async b => {
			for await (const [file, src] of resources()) {
				await b.copyResourceFile(file, src);
			}
		}
	);
}

async function browser(dest) {
	for await (const [file, src] of resources()) {
		await copyFile(src, `${dest}/${file}`);
	}
	await copyFile('src/browser/index.html', `${dest}/index.html`);
}

const task = {'': _ => Object.keys(task).map(t => t && console.error(t)) && 1};

task['clean'] = async () => {
	await remove('build', 'dist');
};

task['build:pages'] = async () => {
	const build = 'build/pages';
	await remove(build);
	await browser(build);
	await docs('docs', build);
};

task['build:browser'] = async () => {
	const build = 'build/browser';
	await remove(build);
	await browser(`${build}/data`);
	await outputFile(
		`${build}/${appFile}.html`,
		'<meta http-equiv="refresh" content="0;url=data/index.html">\n'
	);
	await docs('docs', build);
};

task['dist:browser:zip'] = async () => {
	await makeZip(`dist/${distName}-Browser.zip`, 'build/browser');
};

task['dist:browser:tgz'] = async () => {
	await makeTgz(`dist/${distName}-Browser.tgz`, 'build/browser');
};

for (const [type, pkg] of [
	['i386', 'flash-player-32.0.0.465-windows-sa'],
	['i386-debug', 'flash-player-32.0.0.465-windows-sa-debug']
]) {
	const build = `build/windows-${type}`;
	task[`build:windows-${type}`] = async () => {
		await remove(build);
		const file = `${appFile}.exe`;
		const b = new BundleWindows32(`${build}/${file}`);
		b.projector.versionStrings = {
			FileVersion: version,
			ProductVersion: versionShort,
			CompanyName: author,
			FileDescription: appName,
			LegalCopyright: copyright,
			ProductName: appName,
			LegalTrademarks: '',
			OriginalFilename: file,
			InternalName: appFile,
			Comments: ''
		};
		b.projector.iconFile = 'res/app-icon-windows.ico';
		b.projector.patchWindowTitle = appName;
		b.projector.removeCodeSignature = true;
		await bundle(b, pkg);
		await docs('docs', build);
	};
	task[`dist:windows-${type}:zip`] = async () => {
		await makeZip(`dist/${distName}-Windows-${type}.zip`, build);
	};
	task[`dist:windows-${type}:exe`] = async () => {
		await makeExe(
			`dist/${distName}-Windows.exe`,
			appDomain,
			appName,
			appFile,
			version,
			author,
			copyright,
			'LICENSE.txt',
			'res/inno-icon.ico',
			'res/inno-header/*.bmp',
			'res/inno-sidebar/*.bmp',
			`${build}/*`,
			[
				[`${appFile}.exe`, appFile, true, true],
				['README.html', `${appFile} - README`]
			]
		);
	};
}

for (const [type, pkg] of [
	['x86_64', 'flash-player-32.0.0.465-mac-sa-zip'],
	['x86_64-debug', 'flash-player-32.0.0.465-mac-sa-debug-zip']
]) {
	const build = `build/mac-${type}`;
	task[`build:mac-${type}`] = async () => {
		await remove(build);
		const pkgInfo = 'APPL????';
		const b = new BundleMacApp(`${build}/${appFile}.app`);
		b.projector.binaryName = appFile;
		b.projector.pkgInfoData = pkgInfo;
		b.projector.infoPlistData = (new Plist(new ValueDict(new Map([
			['CFBundleInfoDictionaryVersion', new ValueString('6.0')],
			['CFBundleDevelopmentRegion', new ValueString('en-US')],
			['CFBundleExecutable', new ValueString('')],
			['CFBundleIconFile', new ValueString('')],
			['CFBundleName', new ValueString(appName)],
			['NSHumanReadableCopyright', new ValueString(copyright)],
			['CFBundleGetInfoString', new ValueString(copyright)],
			['CFBundleIdentifier', new ValueString(appDomain)],
			['CFBundleVersion', new ValueString(version)],
			['CFBundleLongVersionString', new ValueString(version)],
			['CFBundleShortVersionString', new ValueString(versionShort)],
			['CFBundlePackageType', new ValueString(pkgInfo.substring(0, 4))],
			['CFBundleSignature', new ValueString(pkgInfo.substring(4))],
			['NSAppTransportSecurity', new ValueDict(new Map([
				['NSAllowsArbitraryLoads', new ValueBoolean(true)]
			]))],
			['NSSupportsAutomaticGraphicsSwitching', new ValueBoolean(true)],
			['NSHighResolutionCapable', new ValueBoolean(true)],
			['CSResourcesFileMapped', new ValueBoolean(true)],
			['LSPrefersCarbon', new ValueString('YES')],
			['NSAppleScriptEnabled', new ValueString('YES')],
			['NSMainNibFile', new ValueString('MainMenu')],
			['NSPrincipalClass', new ValueString('NSApplication')]
		])))).toXml();
		b.projector.iconFile = 'res/app-icon-mac.icns';
		b.projector.patchWindowTitle = appName;
		b.projector.removeInfoPlistStrings = true;
		b.projector.removeCodeSignature = true;
		await bundle(b, pkg);
		await docs('docs', build);
	};
	task[`dist:mac-${type}:tgz`] = async () => {
		await makeTgz(`dist/${distName}-Mac-${type}.tgz`, build);
	};
	task[`dist:mac-${type}:dmg`] = async () => {
		await makeDmg(
			`dist/${distName}-Mac-${type}.dmg`,
			appDmgTitle,
			'res/dmg-icon.icns',
			'res/dmg-background/dmg-background.png',
			[640, 512],
			128,
			[
				[-160, -148, 'file', `${build}/${appFile}.app`],
				[160, -148, 'link', '/Applications'],
				[0, 100, 'file', `${build}/README.html`]
			]
		);
	};
}

for (const [type, pkg] of [
	['i386', 'flash-player-11.2.202.644-linux-i386-sa'],
	['i386-debug', 'flash-player-11.2.202.644-linux-i386-sa-debug'],
	['x86_64', 'flash-player-32.0.0.465-linux-x86_64-sa'],
	['x86_64-debug', 'flash-player-32.0.0.465-linux-x86_64-sa-debug']
]) {
	const build = `build/linux-${type}`;
	task[`build:linux-${type}`] = async () => {
		await remove(build);
		const b = new (/x86_64/.test(type) ? BundleLinux64 : BundleLinux32)(
			`${build}/${appFile}`
		);
		if (b instanceof BundleLinux64) {
			b.projector.patchProjectorOffset = true;
		}
		b.projector.patchProjectorPath = true;
		b.projector.patchWindowTitle = appName;
		await bundle(b, pkg, true);
		await docs('docs', build);
	};
	task[`dist:linux-${type}:tgz`] = async () => {
		await makeTgz(`dist/${distName}-Linux-${type}.tgz`, build);
	};
}

process.exitCode = await task[process.argv[2] || '']();
