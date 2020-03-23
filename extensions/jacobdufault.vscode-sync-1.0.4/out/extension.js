"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis = require("googleapis");
const vscode = require("vscode");
const os = require("os");
const fs = require("fs");
const child_process = require("child_process");
let gFilename = '';
let gAuthCode;
let gAuthCredentials;
// Fetches the list of installed extension IDs.
function getInstalledExtensionIds() {
    let installed = new Array();
    for (let extension of vscode.extensions.all) {
        if (extension.packageJSON.isBuiltin)
            continue;
        installed.push(extension.id);
    }
    return installed;
}
class Config {
    constructor() {
        this.settings = new Array();
        this.keybindings = new Array();
        this.locale = new Array();
        this.extensions = new Array();
    }
}
// Opens up a browser so the user can get a Google Drive auth token.
function getAuthCodeFromUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = getOauth2Client().generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive'],
        });
        yield vscode.window.showInputBox({
            value: url,
            prompt: 'Please open this URL in your browser, complete the flow, and paste the token in the next input box.'
        });
        return yield vscode.window.showInputBox({ prompt: 'Enter token from web browser', ignoreFocusOut: true });
    });
}
// Checks to see if an auth token is available. Asks the user for one if there
// is none.
function checkToken() {
    return __awaiter(this, void 0, void 0, function* () {
        if (gAuthCode && gAuthCredentials && gFilename)
            return true;
        const kFilenamePref = 'sync.filename';
        const kCodePref = 'sync.code';
        const kCredentialsPref = 'sync.credentials';
        let config = vscode.workspace.getConfiguration();
        gFilename = config.get(kFilenamePref, '');
        if (!gFilename) {
            vscode.window.showErrorMessage(`${kFilenamePref} cannot be empty`);
            return false;
        }
        gAuthCode = config.get(kCodePref);
        if (!gAuthCode) {
            gAuthCode = yield getAuthCodeFromUser();
            if (gAuthCode)
                config.update(kCodePref, gAuthCode, vscode.ConfigurationTarget.Global);
        }
        if (!gAuthCode)
            return false;
        let configValue = config.get(kCredentialsPref);
        if (configValue)
            gAuthCredentials = JSON.parse(configValue);
        if (!gAuthCredentials || !gAuthCredentials.access_token) {
            let auth = getOauth2Client();
            let token = yield auth.getToken(gAuthCode);
            if (token.res && token.res.status == 200) {
                config.update(kCredentialsPref, JSON.stringify(token.tokens), vscode.ConfigurationTarget.Global);
                gAuthCredentials = token.tokens;
            }
        }
        return !!gAuthCredentials;
    });
}
function findFileInGDrive(drive, warn) {
    return __awaiter(this, void 0, void 0, function* () {
        let file = yield drive.files.list({ q: `name = '${gFilename}'` });
        if (!file.data.files || file.data.files.length == 0) {
            if (warn)
                vscode.window.showInformationMessage(`Sync: Unable to find ${gFilename}`);
            return;
        }
        if (file.data.files.length > 1) {
            if (warn) {
                vscode.window.showErrorMessage(`Sync: There is more than one matching ${gFilename} file. Please delete some of them.`);
            }
            return;
        }
        return file.data.files[0].id;
    });
}
function uploadConfigToGDrive(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield checkToken()))
            return;
        let body = JSON.stringify(config, null, 2);
        let drive = googleapis.google.drive({ version: 'v3', auth: getOauth2Client() });
        let id = yield findFileInGDrive(drive, /*warn*/ false);
        if (!id) {
            yield drive.files.create({
                requestBody: { name: gFilename, mimeType: 'text/plain' },
                media: { mediaType: 'application/json', body: body }
            });
            return;
        }
        yield drive.files.update({ fileId: id, media: { mediaType: 'application/json', body: body } });
    });
}
// Downloads the config from google drive.
function downloadConfigFromGDrive() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield checkToken()))
            throw new Error('No token');
        let drive = googleapis.google.drive({ version: 'v3', auth: getOauth2Client() });
        let id = yield findFileInGDrive(drive, /*warn*/ true);
        if (!id)
            throw new Error('Cannot find file');
        let content = yield drive.files.get({
            fileId: id,
            alt: 'media'
        });
        let data = content.data;
        let config = new Config();
        for (let key in config) {
            if (data[key])
                config[key] = data[key];
        }
        return config;
    });
}
// Builds an oauth2 client. If credentials are available the client is
// authenticated.
function getOauth2Client() {
    let auth = new googleapis.google.auth.OAuth2('110900474720-ca2o8jidt9fbmup9c50t51bjrl5omdk4.apps.googleusercontent.com', // client_id
    'UFH1TiCGBNp9ZCykoSdvRPF5', // client_secret
    'urn:ietf:wg:oauth:2.0:oob');
    if (gAuthCredentials)
        auth.setCredentials(gAuthCredentials);
    return auth;
}
function getOsName() {
    switch (os.platform()) {
        case 'darwin':
            return 'macos';
        case 'linux':
            return 'linux';
        case 'win32':
            return 'windows';
    }
    throw new Error('Unknown platform ' + os.platform());
}
function getHostname() {
    return os.hostname();
}
function getEnv(name) {
    return process.env[name];
}
function getConfigPath(filename) {
    let home = getEnv('HOME');
    let appData = getEnv('APPDATA');
    switch (os.platform()) {
        case 'darwin':
            return `${home}/Library/Application Support/Code/User/${filename}`;
        case 'linux':
            return `${home}/.config/Code/User/${filename}`;
        case 'win32':
            return `${appData}/Code/User/${filename}`;
    }
    throw new Error('Unknown platform ' + os.platform());
}
function runCodeBinary(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let bin = 'code';
        if (os.platform() == 'win32')
            bin = 'code.cmd';
        return new Promise(done => {
            let child = child_process.spawn(bin, args);
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', data => {
                stdout += data;
            });
            child.stderr.on('data', data => {
                stderr += data;
            });
            child.on('close', () => {
                console.log(`Output of ${bin} ${args.join(' ')}`);
                if (stdout)
                    console.log(`==stdout==\n${stdout}`);
                if (stderr)
                    console.log(`==stderr==\n${stderr}`);
                done();
            });
        });
    });
}
// Shows a notification that goes away after a little while.
function showTimedNotification(message) {
    const kDurationMs = 5000;
    vscode.window.withProgress({ cancellable: false, location: vscode.ProgressLocation.Notification, title: message }, (progress) => {
        progress.report({ increment: 100 });
        return new Promise((resolve, reject) => {
            setTimeout(resolve.bind(true), kDurationMs);
        });
    });
}
function downloadCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            function write(name, contentLines) {
                let path = getConfigPath(name);
                let content = contentLines.join('\n');
                let local = uncommentForLocalSave(content);
                fs.writeFileSync(path, local);
            }
            let config = yield downloadConfigFromGDrive();
            // Update settings files.
            write('settings.json', config.settings);
            write('keybindings.json', config.keybindings);
            write('locale.json', config.locale);
            // Add/remove extensions.
            let installed = getInstalledExtensionIds();
            let expected = config.extensions;
            let toInstall = expected.filter(x => installed.indexOf(x) < 0);
            let toRemove = installed.filter(x => expected.indexOf(x) < 0);
            for (let id of toInstall) {
                showTimedNotification(`Installing extension ${id}`);
                yield runCodeBinary(['--install-extension', id]);
            }
            for (let id of toRemove) {
                showTimedNotification(`Removing extension ${id}`);
                yield runCodeBinary(['--uninstall-extension', id]);
            }
            showTimedNotification('Sync download success');
            if (toInstall.length > 0 || toRemove.length > 0) {
                let msg = 'Please reload the window.';
                if (toInstall.length > 0)
                    msg += ` Installed extensions: ${toInstall.join(' ')}`;
                if (toRemove.length > 0)
                    msg += ` Removed extensions: ${toRemove.join(' ')}`;
                const kReload = 'Reload';
                let action = yield vscode.window.showInformationMessage(msg, kReload);
                if (action == kReload)
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        }
        catch (e) {
            vscode.window.showErrorMessage(`Sync download failed: ${e}`);
        }
    });
}
function uploadCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            function read(name) {
                let path = getConfigPath(name);
                let raw = fs.readFileSync(path).toString();
                return commentForUpload(raw);
            }
            let config = new Config();
            config.settings = read('settings.json');
            config.keybindings = read('keybindings.json');
            config.locale = read('locale.json');
            config.extensions = getInstalledExtensionIds();
            yield uploadConfigToGDrive(config);
            showTimedNotification('Sync upload success');
        }
        catch (e) {
            vscode.window.showErrorMessage(`Sync upload failed: ${e}`);
        }
    });
}
function commentForUpload(fileContent) {
    function err(msg) {
        vscode.window.showErrorMessage(msg);
    }
    let result = [];
    let inSync = false;
    for (let line of fileContent.split(/\r?\n/)) {
        let syncIf = line.includes('@syncIf');
        let end = line.includes('@end');
        if (syncIf && end)
            err('@syncIf and @end cannot be be on same line');
        if (syncIf && inSync)
            err('@syncIf nesting is not supported');
        if (inSync && line.trim().startsWith('//') == false) {
            let offset = line.length - line.trim().length;
            result.push(line.substring(0, offset) + '//' + line.substring(offset));
            continue;
        }
        if (syncIf)
            inSync = true;
        if (end)
            inSync = false;
        result.push(line);
    }
    return result;
}
function uncommentForLocalSave(fileContent) {
    function err(msg) {
        vscode.window.showErrorMessage(msg);
    }
    let result = [];
    let inSync = false;
    let applyBlock = false;
    for (let line of fileContent.split(/\r?\n/)) {
        if (!line.trim().startsWith('//')) {
            result.push(line);
            continue;
        }
        let syncIf = line.includes('@syncIf');
        let end = line.includes('@end');
        if (!syncIf && !end && !inSync) {
            result.push(line);
            continue;
        }
        if (syncIf && end)
            err('@syncIf and @end cannot be be on same line');
        if (syncIf && inSync)
            err('@syncIf nesting is not supported');
        if (syncIf)
            inSync = true;
        if (end) {
            inSync = false;
            applyBlock = false;
            result.push(line);
            continue;
        }
        if (!syncIf) {
            if (applyBlock) {
                result.push(line.replace('//', ''));
            }
            else {
                result.push(line);
            }
            continue;
        }
        // Determine if we want to apply this block.
        result.push(line);
        function extractToken(identifier) {
            let index = line.indexOf(identifier);
            if (index < 0)
                return;
            let start = index + identifier.length;
            let result = '';
            while (start < line.length && line.charAt(start) != ' ') {
                result += line.charAt(start);
                start++;
            }
            if (result == '')
                return undefined;
            return result;
        }
        applyBlock = true;
        // Verify hostname matches.
        let hostname = extractToken('hostname:');
        if (hostname && getHostname() != hostname)
            applyBlock = false;
        // Verify os matches.
        let os = extractToken('os:');
        if (os && getOsName() != os)
            applyBlock = false;
    }
    return result.join('\n');
}
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.subscriptions.push(vscode.commands.registerCommand('sync.download', downloadCommand));
        context.subscriptions.push(vscode.commands.registerCommand('sync.upload', uploadCommand));
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map