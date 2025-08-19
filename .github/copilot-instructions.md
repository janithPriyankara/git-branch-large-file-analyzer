<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	Git Repository Space Analyzer tool with IDE plugins:
	- Core Tool: TypeScript/Node.js CLI tool to analyze git repositories
	- IntelliJ Plugin: Java-based plugin for IntelliJ IDEA  
	- VS Code Extension: TypeScript extension for Visual Studio Code
	- Purpose: Identify large files, artifacts, and space-consuming items across all git branches

- [x] Scaffold the Project
	Project structure created with:
	- Core TypeScript/Node.js CLI tool in packages/core
	- VS Code extension in packages/vscode-extension  
	- IntelliJ IDEA plugin in packages/intellij-plugin
	- Monorepo setup with workspaces
	- Basic implementation files and configurations

- [x] Customize the Project
	Enhanced the project with:
	- Complete Git analysis engine implementation
	- CLI interface with comprehensive options
	- VS Code extension with tree view and webview reports
	- IntelliJ plugin with native integration
	- Detailed README and documentation

- [x] Install Required Extensions
	No additional extensions required for this project type.

- [x] Compile the Project
	Successfully compiled:
	- Core TypeScript package built without errors
	- VS Code extension compiled successfully
	- IntelliJ plugin uses Gradle build system

- [ ] Create and Run Task
	<!--
	Verify that all previous steps have been completed.
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.
	 -->

- [ ] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [ ] Ensure Documentation is Complete
	<!--
	Verify that all previous steps have been completed.
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
	 -->

## Project Details
This is a Git Repository Space Analyzer tool with IDE plugins:
- **Core Tool**: TypeScript/Node.js CLI tool to analyze git repositories
- **IntelliJ Plugin**: Java-based plugin for IntelliJ IDEA
- **VS Code Extension**: TypeScript extension for Visual Studio Code
- **Purpose**: Identify large files, artifacts, and space-consuming items across all git branches
