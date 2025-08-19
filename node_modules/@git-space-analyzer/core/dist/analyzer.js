"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitSpaceAnalyzer = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
const fs_1 = require("fs");
class GitSpaceAnalyzer {
    constructor(repositoryPath, options = {}) {
        this.repositoryPath = repositoryPath;
        this.options = {
            threshold: options.threshold || 1024 * 1024, // 1MB default
            includeBranches: options.includeBranches || 'all',
            excludePatterns: options.excludePatterns || ['.git/**', 'node_modules/**'],
            maxResults: options.maxResults || 100,
            analyzeHistory: options.analyzeHistory !== false,
        };
        if (!this.isGitRepository()) {
            throw new Error(`Directory ${repositoryPath} is not a Git repository`);
        }
    }
    isGitRepository() {
        return (0, fs_1.existsSync)((0, path_1.join)(this.repositoryPath, '.git'));
    }
    execGit(command) {
        try {
            return (0, child_process_1.execSync)(`git ${command}`, {
                cwd: this.repositoryPath,
                encoding: 'utf8',
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            }).trim();
        }
        catch (error) {
            throw new Error(`Git command failed: ${command}\n${error}`);
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    async analyze() {
        console.log('Starting Git repository analysis...');
        // Get all branches
        const branches = this.getAllBranches();
        console.log(`Found ${branches.length} branches`);
        // Get large files across all branches
        const largeFiles = await this.findLargeFiles();
        console.log(`Found ${largeFiles.length} large files`);
        // Analyze each branch
        const branchAnalysis = await this.analyzeBranches(branches);
        // Generate recommendations
        const recommendations = this.generateRecommendations(largeFiles, branchAnalysis);
        // Create summary
        const summary = this.createSummary(largeFiles, branchAnalysis);
        const totalSize = this.getRepositorySize();
        return {
            repositoryPath: this.repositoryPath,
            totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            largeFiles,
            branchAnalysis,
            recommendations,
            summary,
        };
    }
    getAllBranches() {
        const remoteBranches = this.execGit('branch -r --format="%(refname:short)"').split('\n').filter(Boolean);
        const localBranches = this.execGit('branch --format="%(refname:short)"').split('\n').filter(Boolean);
        const allBranches = [...new Set([...localBranches, ...remoteBranches])];
        if (this.options.includeBranches !== 'all') {
            return allBranches.filter(branch => this.options.includeBranches.includes(branch));
        }
        return allBranches;
    }
    async findLargeFiles() {
        // Get all objects with their sizes
        const objectsOutput = this.execGit('cat-file --batch-check --batch-all-objects');
        const objects = [];
        for (const line of objectsOutput.split('\n')) {
            if (!line.trim())
                continue;
            const [hash, type, size] = line.split(' ');
            if (type === 'blob' && parseInt(size) >= this.options.threshold) {
                objects.push({
                    hash,
                    type: type,
                    size: parseInt(size),
                });
            }
        }
        // Sort by size descending
        objects.sort((a, b) => b.size - a.size);
        // Limit results
        const limitedObjects = objects.slice(0, this.options.maxResults);
        // Get file paths and branch information for each object
        const largeFiles = [];
        for (const obj of limitedObjects) {
            try {
                // Find all references to this blob
                const refs = this.execGit(`show-ref --heads`).split('\n');
                const branches = [];
                const commits = [];
                for (const ref of refs) {
                    if (!ref.trim())
                        continue;
                    const [commitHash, refName] = ref.split(' ');
                    const branchName = refName.replace('refs/heads/', '');
                    try {
                        // Check if this blob exists in this branch
                        const lsTreeOutput = this.execGit(`ls-tree -r ${commitHash}`);
                        if (lsTreeOutput.includes(obj.hash)) {
                            branches.push(branchName);
                            commits.push(commitHash);
                        }
                    }
                    catch {
                        // Branch might not exist locally, skip
                    }
                }
                // Get file path from current HEAD (if it exists there)
                let path = '';
                try {
                    const lsTreeOutput = this.execGit(`ls-tree -r HEAD`);
                    const match = lsTreeOutput.split('\n').find(line => line.includes(obj.hash));
                    if (match) {
                        path = match.split('\t')[1] || '';
                    }
                }
                catch {
                    // File might not exist in HEAD
                    path = `<deleted-file-${obj.hash.substring(0, 8)}>`;
                }
                const mainBranch = this.getMainBranch();
                const isInMainBranch = branches.includes(mainBranch);
                largeFiles.push({
                    hash: obj.hash,
                    type: 'blob',
                    size: obj.size,
                    path,
                    sizeFormatted: this.formatBytes(obj.size),
                    branches,
                    commits,
                    isInMainBranch,
                });
            }
            catch (error) {
                console.warn(`Could not analyze object ${obj.hash}: ${error}`);
            }
        }
        return largeFiles;
    }
    getMainBranch() {
        try {
            return this.execGit('symbolic-ref refs/remotes/origin/HEAD').replace('refs/remotes/origin/', '');
        }
        catch {
            // Fallback to common main branch names
            const branches = this.execGit('branch -r').split('\n');
            for (const common of ['main', 'master', 'develop']) {
                if (branches.some(b => b.includes(common))) {
                    return common;
                }
            }
            return 'main'; // Default fallback
        }
    }
    async analyzeBranches(branches) {
        const analysis = [];
        for (const branch of branches) {
            try {
                // Get branch size (approximate)
                const isRemote = branch.startsWith('origin/');
                const refName = isRemote ? `refs/remotes/${branch}` : `refs/heads/${branch}`;
                // Get last commit date
                let lastCommitDate;
                try {
                    const dateStr = this.execGit(`log -1 --format="%ci" ${branch}`);
                    lastCommitDate = new Date(dateStr);
                }
                catch {
                    // Branch might not exist locally
                }
                // Find large files specific to this branch
                const branchLargeFiles = [];
                // This is a simplified approach - in a real implementation,
                // you'd want to checkout each branch and analyze
                analysis.push({
                    name: branch,
                    size: 0, // Would need more sophisticated calculation
                    sizeFormatted: '0 B',
                    uniqueSize: 0,
                    uniqueSizeFormatted: '0 B',
                    largeFiles: branchLargeFiles,
                    isRemote,
                    lastCommitDate,
                });
            }
            catch (error) {
                console.warn(`Could not analyze branch ${branch}: ${error}`);
            }
        }
        return analysis;
    }
    generateRecommendations(largeFiles, branchAnalysis) {
        const recommendations = [];
        // Recommend removing files not in main branch
        const filesNotInMain = largeFiles.filter(file => !file.isInMainBranch);
        if (filesNotInMain.length > 0) {
            const totalSavings = filesNotInMain.reduce((sum, file) => sum + file.size, 0);
            recommendations.push({
                type: 'large-file',
                severity: 'high',
                description: `${filesNotInMain.length} large files exist only in non-main branches`,
                potentialSavings: totalSavings,
                potentialSavingsFormatted: this.formatBytes(totalSavings),
                actionable: true,
                action: 'Consider removing these files from historical commits using git filter-branch or BFG',
            });
        }
        // Recommend cleaning up very large files
        const veryLargeFiles = largeFiles.filter(file => file.size > 10 * 1024 * 1024); // 10MB+
        if (veryLargeFiles.length > 0) {
            const totalSavings = veryLargeFiles.reduce((sum, file) => sum + file.size, 0);
            recommendations.push({
                type: 'large-file',
                severity: 'high',
                description: `${veryLargeFiles.length} very large files (>10MB) found`,
                potentialSavings: totalSavings,
                potentialSavingsFormatted: this.formatBytes(totalSavings),
                actionable: true,
                action: 'Consider using Git LFS for these files or removing them if no longer needed',
            });
        }
        // Identify potential binary artifacts
        const potentialArtifacts = largeFiles.filter(file => /\.(jar|war|ear|zip|tar|gz|exe|dll|so|dylib|a|lib)$/i.test(file.path));
        if (potentialArtifacts.length > 0) {
            const totalSavings = potentialArtifacts.reduce((sum, file) => sum + file.size, 0);
            recommendations.push({
                type: 'binary-artifact',
                severity: 'medium',
                description: `${potentialArtifacts.length} potential binary artifacts found`,
                potentialSavings: totalSavings,
                potentialSavingsFormatted: this.formatBytes(totalSavings),
                actionable: true,
                action: 'Review if these build artifacts should be in version control',
            });
        }
        return recommendations;
    }
    createSummary(largeFiles, branchAnalysis) {
        const largestFile = largeFiles.length > 0 ? largeFiles[0] : null;
        const oldestLargeFile = largeFiles.length > 0 ?
            largeFiles.reduce((oldest, file) => {
                // This would need actual commit date analysis
                return oldest; // Simplified for now
            }, largeFiles[0]) : null;
        const branchesWithLargeFiles = branchAnalysis.filter(branch => branch.largeFiles.length > 0).length;
        const estimatedCleanupSavings = largeFiles
            .filter(file => !file.isInMainBranch)
            .reduce((sum, file) => sum + file.size, 0);
        return {
            totalFiles: largeFiles.length,
            totalBranches: branchAnalysis.length,
            largestFile,
            oldestLargeFile,
            branchesWithLargeFiles,
            estimatedCleanupSavings,
            estimatedCleanupSavingsFormatted: this.formatBytes(estimatedCleanupSavings),
        };
    }
    getRepositorySize() {
        try {
            // Get .git directory size
            const sizeOutput = this.execGit('count-objects -v');
            const lines = sizeOutput.split('\n');
            let totalSize = 0;
            for (const line of lines) {
                if (line.startsWith('size ')) {
                    totalSize += parseInt(line.split(' ')[1]) * 1024; // Git reports in KB
                }
                if (line.startsWith('size-pack ')) {
                    totalSize += parseInt(line.split(' ')[1]) * 1024;
                }
            }
            return totalSize;
        }
        catch {
            return 0;
        }
    }
}
exports.GitSpaceAnalyzer = GitSpaceAnalyzer;
//# sourceMappingURL=analyzer.js.map