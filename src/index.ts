import * as fs from 'fs';
import * as path from 'path'

const BAIL_LIMIT = 20;

var noDefCount = 0;

type PathObj = {[K: string]: number}

const paths: PathObj = {
	"a/a1": 1,
	"a/a2": 1,
	"a": 2
};

const cwd = process.cwd() + "/data";
console.log(cwd)

function santizePath(p: string) {
	var ret = p.replace(/(\/|^)\.\.\//g, "$1")
	var ret = ret.replace(/\/\.\.$/,"")
	var ret = ret.replace(/^\/\//g, "/")
	var ret = ret.replace(/^\//, "")
	return ret;
}

const decoratedPaths = Object.keys(paths).reduce((agg, p) => {
	const decoratedPaths = path.join(cwd, santizePath(p));
	agg[decoratedPaths] = paths[p];
	return agg;
}, {} as PathObj)

function recurseIntoDir(dir: string, mode: number) {
	fs.readdirSync(dir).forEach(f => {
		const fPath = path.join(dir, f)
		const isDir = fs.lstatSync(fPath).isDirectory();
		const newMode = decoratedPaths[fPath] || mode
		if (newMode == -1) {
			noDefCount++;
			console.log(`no mode for ${fPath}`)
		}
		if (noDefCount >= BAIL_LIMIT) {
			console.log("aborting.")
			process.exit(1)
		}
		if (isDir) recurseIntoDir(fPath, newMode);
	})
}

recurseIntoDir(cwd, -1)