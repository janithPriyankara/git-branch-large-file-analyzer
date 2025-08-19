"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitSpaceAnalyzerProvider = void 0;
const vscode = __importStar(require("vscode"));
class GitSpaceAnalyzerProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.analysis = null;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    updateAnalysis(analysis) {
        this.analysis = analysis;
        this.refresh();
    }
    getCurrentAnalysis() {
        return this.analysis;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
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
            return Promise.resolve(this.analysis.largeFiles.slice(0, 20).map(file => {
                const item = new GitSpaceItem(`${file.path} (${file.sizeFormatted})`, vscode.TreeItemCollapsibleState.None, 'file');
                item.tooltip = `Size: ${file.sizeFormatted}\nBranches: ${file.branches.join(', ')}\nIn main: ${file.isInMainBranch ? 'Yes' : 'No'}`;
                item.iconPath = new vscode.ThemeIcon(file.isInMainBranch ? 'file' : 'warning');
                return item;
            }));
        }
        if (element.contextValue === 'recommendations') {
            return Promise.resolve(this.analysis.recommendations.map(rec => {
                const item = new GitSpaceItem(`${rec.severity.toUpperCase()}: ${rec.description}`, vscode.TreeItemCollapsibleState.None, 'recommendation');
                item.tooltip = `${rec.description}\nPotential savings: ${rec.potentialSavingsFormatted}\n${rec.action || ''}`;
                item.iconPath = new vscode.ThemeIcon(rec.severity === 'high' ? 'error' :
                    rec.severity === 'medium' ? 'warning' : 'info');
                return item;
            }));
        }
        if (element.contextValue === 'branches') {
            return Promise.resolve(this.analysis.branchAnalysis.slice(0, 10).map(branch => {
                const item = new GitSpaceItem(`${branch.name} (${branch.isRemote ? 'Remote' : 'Local'})`, vscode.TreeItemCollapsibleState.None, 'branch');
                item.tooltip = `Type: ${branch.isRemote ? 'Remote' : 'Local'}\nLarge files: ${branch.largeFiles.length}\nLast commit: ${branch.lastCommitDate?.toLocaleDateString() || 'Unknown'}`;
                item.iconPath = new vscode.ThemeIcon(branch.isRemote ? 'cloud' : 'git-branch');
                return item;
            }));
        }
        return Promise.resolve([]);
    }
}
exports.GitSpaceAnalyzerProvider = GitSpaceAnalyzerProvider;
class GitSpaceItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.contextValue = contextValue;
        this.contextValue = contextValue;
    }
}
//# sourceMappingURL=provider.js.map