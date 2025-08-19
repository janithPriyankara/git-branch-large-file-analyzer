import { AnalysisResult, AnalysisOptions } from './types';
export declare class GitSpaceAnalyzer {
    private repositoryPath;
    private options;
    constructor(repositoryPath: string, options?: Partial<AnalysisOptions>);
    private isGitRepository;
    private execGit;
    private formatBytes;
    analyze(): Promise<AnalysisResult>;
    private getAllBranches;
    private findLargeFiles;
    private getMainBranch;
    private analyzeBranches;
    private generateRecommendations;
    private createSummary;
    private getRepositorySize;
}
//# sourceMappingURL=analyzer.d.ts.map