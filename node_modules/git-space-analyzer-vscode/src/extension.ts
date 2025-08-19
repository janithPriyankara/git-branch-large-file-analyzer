import * as vscode from 'vscode';
import { GitSpaceAnalyzer } from '@git-space-analyzer/core';
import { GitSpaceAnalyzerProvider } from './provider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Space Analyzer extension is now active!');

    // Register the tree data provider
    const provider = new GitSpaceAnalyzerProvider(context);
    vscode.window.registerTreeDataProvider('gitSpaceAnalyzer', provider);

    // Register commands
    const analyzeCommand = vscode.commands.registerCommand('gitSpaceAnalyzer.analyze', async (uri?: vscode.Uri) => {
        const workspaceFolder = uri ? vscode.workspace.getWorkspaceFolder(uri) : vscode.workspace.workspaceFolders?.[0];
        
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        const repositoryPath = workspaceFolder.uri.fsPath;

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing Git repository space...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Starting analysis...' });

                const analyzer = new GitSpaceAnalyzer(repositoryPath);
                const result = await analyzer.analyze();

                progress.report({ increment: 100, message: 'Analysis completed' });

                // Update the tree view
                provider.updateAnalysis(result);

                // Show summary
                const message = `Analysis completed! Found ${result.summary.totalFiles} large files. ` +
                               `Potential savings: ${result.summary.estimatedCleanupSavingsFormatted}`;
                vscode.window.showInformationMessage(message, 'View Report').then(selection => {
                    if (selection === 'View Report') {
                        vscode.commands.executeCommand('gitSpaceAnalyzer.showReport');
                    }
                });
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error}`);
        }
    });

    const showReportCommand = vscode.commands.registerCommand('gitSpaceAnalyzer.showReport', () => {
        const panel = vscode.window.createWebviewPanel(
            'gitSpaceAnalyzerReport',
            'Git Space Analysis Report',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        const analysis = provider.getCurrentAnalysis();
        if (analysis) {
            panel.webview.html = generateReportHTML(analysis);
        } else {
            panel.webview.html = `
                <html>
                <body>
                    <h1>No Analysis Available</h1>
                    <p>Please run an analysis first.</p>
                </body>
                </html>
            `;
        }
    });

    context.subscriptions.push(analyzeCommand, showReportCommand);
}

function generateReportHTML(analysis: any): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Git Space Analysis Report</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                }
                .header {
                    border-bottom: 2px solid #007acc;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .summary {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .table th, .table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .table th {
                    background-color: #007acc;
                    color: white;
                }
                .recommendation {
                    border-left: 4px solid #ffc107;
                    padding: 10px;
                    margin-bottom: 10px;
                    background: #fff3cd;
                }
                .recommendation.high {
                    border-left-color: #dc3545;
                    background: #f8d7da;
                }
                .recommendation.medium {
                    border-left-color: #ffc107;
                    background: #fff3cd;
                }
                .recommendation.low {
                    border-left-color: #17a2b8;
                    background: #d1ecf1;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔍 Git Repository Space Analysis</h1>
                <p><strong>Repository:</strong> ${analysis.repositoryPath}</p>
            </div>

            <div class="summary">
                <h2>📊 Summary</h2>
                <ul>
                    <li><strong>Total Size:</strong> ${analysis.totalSizeFormatted}</li>
                    <li><strong>Large Files:</strong> ${analysis.summary.totalFiles}</li>
                    <li><strong>Branches Analyzed:</strong> ${analysis.summary.totalBranches}</li>
                    <li><strong>Potential Savings:</strong> ${analysis.summary.estimatedCleanupSavingsFormatted}</li>
                </ul>
            </div>

            <h2>📁 Large Files</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>File Path</th>
                        <th>Size</th>
                        <th>Branches</th>
                        <th>In Main Branch</th>
                    </tr>
                </thead>
                <tbody>
                    ${analysis.largeFiles.map((file: any) => `
                        <tr>
                            <td>${file.path}</td>
                            <td>${file.sizeFormatted}</td>
                            <td>${file.branches.length}</td>
                            <td>${file.isInMainBranch ? '✅' : '❌'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h2>💡 Recommendations</h2>
            ${analysis.recommendations.map((rec: any) => `
                <div class="recommendation ${rec.severity}">
                    <h3>${rec.severity.toUpperCase()}: ${rec.description}</h3>
                    <p><strong>Potential Savings:</strong> ${rec.potentialSavingsFormatted}</p>
                    ${rec.action ? `<p><strong>Action:</strong> ${rec.action}</p>` : ''}
                </div>
            `).join('')}
        </body>
        </html>
    `;
}

export function deactivate() {}
