const vscode = require('vscode');
const gatherSnippet = require('./gatherSnippet');
const writeSnippet = require('./writeSnippet');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'snippet-creator.createSnippet',
      createSnippet
    )
  );
}

async function createSnippet() {
  const snippet = await gatherSnippet();
  await writeSnippet(snippet);
}

exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
