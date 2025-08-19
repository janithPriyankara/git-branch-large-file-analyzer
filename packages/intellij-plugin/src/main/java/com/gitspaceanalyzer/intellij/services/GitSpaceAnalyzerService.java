package com.gitspaceanalyzer.intellij.services;

import com.intellij.openapi.components.Service;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.Messages;
import com.intellij.openapi.vfs.VirtualFile;
import git4idea.GitUtil;
import git4idea.repo.GitRepository;
import git4idea.repo.GitRepositoryManager;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service(Service.Level.PROJECT)
public final class GitSpaceAnalyzerService {
    
    private final Project project;
    
    public GitSpaceAnalyzerService(Project project) {
        this.project = project;
    }
    
    public void analyzeRepository() {
        try {
            GitRepository repository = getGitRepository();
            if (repository == null) {
                Messages.showErrorDialog(project, 
                    "No Git repository found in project", 
                    "Git Space Analyzer");
                return;
            }
            
            String repositoryPath = repository.getRoot().getPath();
            
            // Run the analysis in a background thread
            new Thread(() -> {
                try {
                    AnalysisResult result = performAnalysis(repositoryPath);
                    
                    // Update UI on EDT
                    javax.swing.SwingUtilities.invokeLater(() -> {
                        showAnalysisResult(result);
                    });
                    
                } catch (Exception e) {
                    javax.swing.SwingUtilities.invokeLater(() -> {
                        Messages.showErrorDialog(project, 
                            "Analysis failed: " + e.getMessage(), 
                            "Git Space Analyzer");
                    });
                }
            }).start();
            
        } catch (Exception e) {
            Messages.showErrorDialog(project, 
                "Failed to start analysis: " + e.getMessage(), 
                "Git Space Analyzer");
        }
    }
    
    private GitRepository getGitRepository() {
        GitRepositoryManager repositoryManager = GitRepositoryManager.getInstance(project);
        List<GitRepository> repositories = repositoryManager.getRepositories();
        
        if (repositories.isEmpty()) {
            return null;
        }
        
        // Return the first repository (could be enhanced to handle multiple repos)
        return repositories.get(0);
    }
    
    private AnalysisResult performAnalysis(String repositoryPath) throws Exception {
        // This is a simplified analysis - in a real implementation,
        // you would either:
        // 1. Use the Node.js CLI tool via ProcessBuilder
        // 2. Implement the analysis logic in Java
        // 3. Use JNI to call the TypeScript library
        
        ProcessBuilder pb = new ProcessBuilder("git", "count-objects", "-v");
        pb.directory(new File(repositoryPath));
        
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        
        List<String> output = new ArrayList<>();
        String line;
        while ((line = reader.readLine()) != null) {
            output.add(line);
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Git command failed with exit code: " + exitCode);
        }
        
        // Parse the output and create a simplified result
        long totalSize = 0;
        for (String outputLine : output) {
            if (outputLine.startsWith("size ")) {
                totalSize += Long.parseLong(outputLine.split(" ")[1]) * 1024; // Git reports in KB
            }
            if (outputLine.startsWith("size-pack ")) {
                totalSize += Long.parseLong(outputLine.split(" ")[1]) * 1024;
            }
        }
        
        return new AnalysisResult(repositoryPath, totalSize, output);
    }
    
    private void showAnalysisResult(AnalysisResult result) {
        String message = String.format(
            "Repository: %s\nTotal size: %s\n\nRaw git output:\n%s",
            result.getRepositoryPath(),
            formatBytes(result.getTotalSize()),
            String.join("\n", result.getRawOutput())
        );
        
        Messages.showInfoMessage(project, message, "Git Space Analysis Result");
    }
    
    private String formatBytes(long bytes) {
        if (bytes == 0) return "0 B";
        
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.2f %s", size, units[unitIndex]);
    }
    
    // Simple data class for analysis results
    public static class AnalysisResult {
        private final String repositoryPath;
        private final long totalSize;
        private final List<String> rawOutput;
        
        public AnalysisResult(String repositoryPath, long totalSize, List<String> rawOutput) {
            this.repositoryPath = repositoryPath;
            this.totalSize = totalSize;
            this.rawOutput = rawOutput;
        }
        
        public String getRepositoryPath() { return repositoryPath; }
        public long getTotalSize() { return totalSize; }
        public List<String> getRawOutput() { return rawOutput; }
    }
}
