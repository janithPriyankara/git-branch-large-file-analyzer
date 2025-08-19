export interface GitObject {
    hash: string;
    type: 'blob' | 'tree' | 'commit' | 'tag';
    size: number;
    path?: string;
    branch?: string;
    commit?: string;
    date?: Date;
}
export interface LargeFile extends GitObject {
    type: 'blob';
    path: string;
    sizeFormatted: string;
    branches: string[];
    commits: string[];
    isInMainBranch: boolean;
}
export interface AnalysisResult {
    repositoryPath: string;
    totalSize: number;
    totalSizeFormatted: string;
    largeFiles: LargeFile[];
    branchAnalysis: BranchAnalysis[];
    recommendations: Recommendation[];
    summary: AnalysisSummary;
}
export interface BranchAnalysis {
    name: string;
    size: number;
    sizeFormatted: string;
    uniqueSize: number;
    uniqueSizeFormatted: string;
    largeFiles: LargeFile[];
    isRemote: boolean;
    lastCommitDate?: Date;
}
export interface Recommendation {
    type: 'large-file' | 'unused-branch' | 'duplicate-file' | 'binary-artifact';
    severity: 'high' | 'medium' | 'low';
    description: string;
    potentialSavings: number;
    potentialSavingsFormatted: string;
    actionable: boolean;
    action?: string;
}
export interface AnalysisSummary {
    totalFiles: number;
    totalBranches: number;
    largestFile: LargeFile | null;
    oldestLargeFile: LargeFile | null;
    branchesWithLargeFiles: number;
    estimatedCleanupSavings: number;
    estimatedCleanupSavingsFormatted: string;
}
export interface AnalysisOptions {
    threshold: number;
    includeBranches: string[] | 'all';
    excludePatterns: string[];
    maxResults: number;
    analyzeHistory: boolean;
}
//# sourceMappingURL=types.d.ts.map