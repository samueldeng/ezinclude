'use strict';
import * as vscode from 'vscode';

let getPath = function (args: string | any[]) {
	let path = null;
	// trigger from editor/title/context or explorer/context
	if (args && args.length > 0) {
		path = args[0].fsPath;
	}
	// trigger from CommandPalette
	if (!path && vscode.window.activeTextEditor) {
		path = vscode.window.activeTextEditor.document.fileName;
	}
	return path;
};

let pasteAndShowMessage = function (fileName: string) {
	vscode.env.clipboard.writeText(fileName);
	vscode.window.showInformationMessage(`${fileName}" copied!`);
};

let extractIncludePath = function (filePath: string)
{
	// Three Capture Group
	// eg1. framwork/te/impl_include/biz/te/core/session/impl/abc.h
	//			G0: framwork/te/impl_include/biz/te/core/session/impl/abc.h
	// 			G1: framwork/te
	// 			G2: impl_include
	// 			G3: biz/te/core/session/impl/abc.h  --> Use this one
	// eg. framwork/te/include/biz/te/messages/report.h
	//			G0: framwork/te/include/biz/te/messages/report.h
	// 			G1: framwork/te
	// 			G2: include
	// 			G3: biz/te/messages/report.h  --> Use this one
	const includePathRegex = new RegExp('(.*)\/(.*include)\/(.*)');
	const array = filePath.match(includePathRegex);

	if (!array || array.length !== 4)
	{
		console.log(`regex match failed, filePath=${filePath}`);
		return "";
	}

	const includeRelativePath = array[3];
	console.log("include_path = " + includeRelativePath);
	return includeRelativePath;
};
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('ezinclude.copyQuotedInclude', (...args) => {
		var fullPath = getPath(args);
		console.log(`filePath=${fullPath}`);

		var includeRelativePath = extractIncludePath(fullPath);
		if (includeRelativePath === "")
		{
			vscode.window.showErrorMessage(`find include path failed: ${fullPath}`);
			return;
		}

		var includeCopyablePath = `#include "${includeRelativePath}"`;
		pasteAndShowMessage(includeCopyablePath);
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('ezinclude.copyAngleBracketInclude', (...args) => {
		var fullPath = getPath(args);
		console.log(`filePath=${fullPath}`);

		var includeRelativePath = extractIncludePath(fullPath);
		if (includeRelativePath === "")
		{
			vscode.window.showErrorMessage(`find include path failed: ${fullPath}`);
			return;
		}

		var includeCopyablePath = `#include <${includeRelativePath}>`;
		pasteAndShowMessage(includeCopyablePath);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
