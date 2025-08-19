package com.gitspaceanalyzer.intellij.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.Messages;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowManager;
import com.gitspaceanalyzer.intellij.services.GitSpaceAnalyzerService;
import org.jetbrains.annotations.NotNull;

public class AnalyzeAction extends AnAction {

    @Override
    public void actionPerformed(@NotNull AnActionEvent e) {
        Project project = e.getProject();
        if (project == null) {
            return;
        }

        GitSpaceAnalyzerService service = project.getService(GitSpaceAnalyzerService.class);
        if (service == null) {
            Messages.showErrorDialog(project, 
                "Git Space Analyzer service not available", 
                "Error");
            return;
        }

        // Show the tool window
        ToolWindow toolWindow = ToolWindowManager.getInstance(project)
            .getToolWindow("Git Space Analyzer");
        if (toolWindow != null) {
            toolWindow.show();
        }

        // Start the analysis
        service.analyzeRepository();
    }

    @Override
    public void update(@NotNull AnActionEvent e) {
        Project project = e.getProject();
        e.getPresentation().setEnabledAndVisible(project != null);
    }
}
