import * as vscode from 'vscode';
import { AnalysisResult, LargeFile } from '@git-space-analyzer/core';

export class GitSpaceAnalyzerProvider implements vscode.TreeDataProvider<GitSpaceItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<GitSpaceItem | undefined | null | void> = new vscode.EventEmitter<GitSpaceItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<GitSpaceItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private analysis: AnalysisResult | null = null;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    updateAnalysis(analysis: AnalysisResult): void {
        this.analysis = analysis;
        this.refresh();
    }

    getCurrentAnalysis(): AnalysisResult | null {
        return this.analysis;
    }

    getTreeItem(element: GitSpaceItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: GitSpaceItem): Thenable<GitSpaceItem[]> {
        if (!this.analysis) {
            return Promise.resolve([new GitSpaceItem('No analysis available', vscode.TreeItemCollapsibleState.None)]);
        }

        if (!element) {
            // Root level items
            return Promise.resolve([
                new GitSpaceItem(`Summary (${this.analysis.summary.totalFiles} large files)`, vscode.TreeItemCollapsibleState.Expanded, 'summary'),
                new GitSpaceItem(`Large Files (${this.analysis.largeFiles.length})`, vscode.TreeItemCollapsibleState.Expanded, 'files'),
                new GitSpaceItem(`Recommendations (${this.analysis.recommendations.length})`, vscode.TreeItemCollapsibleState.Expanded, 'recommendations'),
                new GitSpaceItem(`Branches (${this.analysis.branchAnalysis.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'branches')
            ]);
        }

        if (element.contextValue === 'summary') {
            return Promise.resolve([
                new GitSpaceItem(`Total Size: ${this.analysis.totalSizeFormatted}`, vscode.TreeItemCollapsibleState.None),
                new GitSpaceItem(`Potential Savings: ${this.analysis.summary.estimatedCleanupSavingsFormatted}`, vscode.TreeItemCollapsibleState.None),
                new GitSpaceItem(`Largest File: ${this.analysis.summary.largestFile?.path || 'None'} (${this.analysis.summary.largestFile?.sizeFormatted || '0 B'})`, vscode.TreeItemCollapsibleState.None)
            ]);
        }

        if (element.contextValue === 'files') {
            return Promise.resolve(
                this.analysis.largeFiles.slice(0, 20).map(file => {
                    const item = new GitSpaceItem(
                        `${file.path} (${file.sizeFormatted})`,
                        vscode.TreeItemCollapsibleState.None,
                        'file'
                    );
                    item.tooltip = `Size: ${file.sizeFormatted}\nBranches: ${file.branches.join(', ')}\nIn main: ${file.isInMainBranch ? 'Yes' : 'No'}`;
                    item.iconPath = new vscode.ThemeIcon(file.isInMainBranch ? 'file' : 'warning');
                    return item;
                })
            );
        }

        if (element.contextValue === 'recommendations') {
            return Promise.resolve(
                this.analysis.recommendations.map(rec => {
                    const item = new GitSpaceItem(
                        `${rec.severity.toUpperCase()}: ${rec.description}`,
                        vscode.TreeItemCollapsibleState.None,
                        'recommendation'
                    );
                    item.tooltip = `${rec.description}\nPotential savings: ${rec.potentialSavingsFormatted}\n${rec.action || ''}`;
                    item.iconPath = new vscode.ThemeIcon(
                        rec.severity === 'high' ? 'error' : 
                        rec.severity === 'medium' ? 'warning' : 'info'
                    );
                    return item;
                })
            );
        }

        if (element.contextValue === 'branches') {
            return Promise.resolve(
                this.analysis.branchAnalysis.slice(0, 10).map(branch => {
                    const item = new GitSpaceItem(
                        `${branch.name} (${branch.isRemote ? 'Remote' : 'Local'})`,
                        vscode.TreeItemCollapsibleState.None,
                        'branch'
                    );
                    item.tooltip = `Type: ${branch.isRemote ? 'Remote' : 'Local'}\nLarge files: ${branch.largeFiles.length}\nLast commit: ${branch.lastCommitDate?.toLocaleDateString() || 'Unknown'}`;
                    item.iconPath = new vscode.ThemeIcon(branch.isRemote ? 'cloud' : 'git-branch');
                    return item;
                })
            );
        }

        return Promise.resolve([]);
    }
}

class GitSpaceItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
    }
}
