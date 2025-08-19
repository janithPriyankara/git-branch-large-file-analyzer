#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const table_1 = require("table");
const analyzer_1 = require("./analyzer");
const program = new commander_1.Command();
program
    .name('git-space-analyzer')
    .description('Analyze Git repository space usage and identify large files')
    .version('1.0.0');
program
    .command('analyze')
    .description('Analyze a Git repository')
    .argument('[path]', 'Path to Git repository', process.cwd())
    .option('-t, --threshold <bytes>', 'Minimum file size to consider (in bytes)', '1048576')
    .option('-l, --limit <number>', 'Maximum number of results to show', '50')
    .option('--branches <branches>', 'Comma-separated list of branches to analyze (default: all)')
    .option('--exclude <patterns>', 'Comma-separated list of file patterns to exclude')
    .option('--no-history', 'Skip historical analysis')
    .action(async (path, options) => {
    const spinner = (0, ora_1.default)('Analyzing repository...').start();
    try {
        const analyzer = new analyzer_1.GitSpaceAnalyzer(path, {
            threshold: parseInt(options.threshold),
            maxResults: parseInt(options.limit),
            includeBranches: options.branches ? options.branches.split(',') : 'all',
            excludePatterns: options.exclude ? options.exclude.split(',') : undefined,
            analyzeHistory: options.history,
        });
        const result = await analyzer.analyze();
        spinner.succeed('Analysis completed');
        displayResults(result);
    }
    catch (error) {
        spinner.fail(`Analysis failed: ${error}`);
        process.exit(1);
    }
});
function displayResults(result) {
    console.log(chalk_1.default.bold.blue('\n🔍 Git Repository Space Analysis'));
    console.log(chalk_1.default.gray('─'.repeat(50)));
    // Summary
    console.log(chalk_1.default.bold('\n📊 Summary:'));
    console.log(`Repository: ${result.repositoryPath}`);
    console.log(`Total size: ${chalk_1.default.yellow(result.totalSizeFormatted)}`);
    console.log(`Large files found: ${chalk_1.default.yellow(result.summary.totalFiles)}`);
    console.log(`Branches analyzed: ${chalk_1.default.yellow(result.summary.totalBranches)}`);
    console.log(`Potential cleanup savings: ${chalk_1.default.green(result.summary.estimatedCleanupSavingsFormatted)}`);
    // Large files table
    if (result.largeFiles.length > 0) {
        console.log(chalk_1.default.bold('\n📁 Large Files:'));
        const fileTableData = [
            ['File', 'Size', 'Branches', 'In Main?'],
            ...result.largeFiles.map(file => [
                file.path.length > 50 ? '...' + file.path.slice(-47) : file.path,
                file.sizeFormatted,
                file.branches.length.toString(),
                file.isInMainBranch ? chalk_1.default.green('✓') : chalk_1.default.red('✗')
            ])
        ];
        console.log((0, table_1.table)(fileTableData, {
            border: {
                topBody: '─',
                topJoin: '┬',
                topLeft: '┌',
                topRight: '┐',
                bottomBody: '─',
                bottomJoin: '┴',
                bottomLeft: '└',
                bottomRight: '┘',
                bodyLeft: '│',
                bodyRight: '│',
                bodyJoin: '│',
                joinBody: '─',
                joinLeft: '├',
                joinRight: '┤',
                joinJoin: '┼'
            }
        }));
    }
    // Recommendations
    if (result.recommendations.length > 0) {
        console.log(chalk_1.default.bold('\n💡 Recommendations:'));
        result.recommendations.forEach((rec, index) => {
            const severityColor = rec.severity === 'high' ? chalk_1.default.red :
                rec.severity === 'medium' ? chalk_1.default.yellow : chalk_1.default.blue;
            console.log(`\n${index + 1}. ${severityColor(rec.severity.toUpperCase())}: ${rec.description}`);
            console.log(`   Potential savings: ${chalk_1.default.green(rec.potentialSavingsFormatted)}`);
            if (rec.action) {
                console.log(`   ${chalk_1.default.gray('Action:')} ${rec.action}`);
            }
        });
    }
    // Branch analysis
    if (result.branchAnalysis.length > 0) {
        console.log(chalk_1.default.bold('\n🌿 Branch Analysis:'));
        const branchTableData = [
            ['Branch', 'Type', 'Last Commit', 'Large Files'],
            ...result.branchAnalysis.slice(0, 10).map(branch => [
                branch.name.length > 30 ? '...' + branch.name.slice(-27) : branch.name,
                branch.isRemote ? 'Remote' : 'Local',
                branch.lastCommitDate ? branch.lastCommitDate.toLocaleDateString() : 'Unknown',
                branch.largeFiles.length.toString()
            ])
        ];
        console.log((0, table_1.table)(branchTableData));
        if (result.branchAnalysis.length > 10) {
            console.log(chalk_1.default.gray(`... and ${result.branchAnalysis.length - 10} more branches`));
        }
    }
    console.log(chalk_1.default.gray('\n' + '─'.repeat(50)));
    console.log(chalk_1.default.bold.green('✨ Analysis complete!'));
    if (result.summary.estimatedCleanupSavings > 0) {
        console.log(chalk_1.default.yellow('\n⚠️  Consider cleaning up large files not in the main branch to save space.'));
        console.log(chalk_1.default.gray('Use tools like BFG Repo-Cleaner or git filter-branch for history cleanup.'));
    }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red('Unhandled Rejection at:'), promise, chalk_1.default.red('reason:'), reason);
    process.exit(1);
});
program.parse();
//# sourceMappingURL=cli.js.map