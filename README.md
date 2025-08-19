# Git Space Analyzer

A comprehensive tool to analyze Git repository space usage and identify large files, artifacts, and unnecessary files across all branches. Available as a CLI tool and plugins for IntelliJ IDEA and VS Code.

## 🚀 Features

- **Complete Repository Analysis**: Scans entire repository including all branches and history
- **Large File Detection**: Identifies files above configurable size thresholds
- **Branch Analysis**: Shows which branches contain large files
- **Smart Recommendations**: Provides actionable insights to reduce repository size
- **Multi-Platform**: Available as CLI tool and IDE plugins
- **Detailed Reporting**: Generate comprehensive reports with visualizations

## 📦 Components

### Core CLI Tool (`packages/core`)
- TypeScript/Node.js based analysis engine
- Command-line interface for repository analysis
- Configurable thresholds and filters
- JSON and human-readable output formats

### VS Code Extension (`packages/vscode-extension`)
- Integrated analysis within VS Code
- Tree view for browsing results
- Webview reports with visualizations
- Quick actions for common cleanup tasks

### IntelliJ IDEA Plugin (`packages/intellij-plugin`)
- Native IntelliJ platform integration
- Tool window for analysis results
- Git integration for seamless workflow
- Background analysis with progress indicators

## 🛠️ Installation

### CLI Tool
```bash
# Install from npm (when published)
npm install -g git-space-analyzer

# Or build from source
cd packages/core
npm install
npm run build
npm link
```

### VS Code Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Git Space Analyzer"
4. Click Install

### IntelliJ IDEA Plugin
1. Open IntelliJ IDEA
2. Go to File → Settings → Plugins
3. Search for "Git Space Analyzer"
4. Click Install and restart IDE

## 📖 Usage

### CLI Tool
```bash
# Analyze current repository
git-space-analyzer analyze

# Analyze specific repository
git-space-analyzer analyze /path/to/repo

# Set custom threshold (files larger than 5MB)
git-space-analyzer analyze --threshold 5242880

# Limit results
git-space-analyzer analyze --limit 20

# Analyze specific branches only
git-space-analyzer analyze --branches main,develop

# Exclude patterns
git-space-analyzer analyze --exclude "*.log,temp/**"
```

### VS Code Extension
1. Open a Git repository in VS Code
2. Use Command Palette (Ctrl+Shift+P)
3. Run "Git Space Analyzer: Analyze Repository"
4. View results in the Git Space Analyzer panel
5. Click "Show Report" for detailed analysis

### IntelliJ IDEA Plugin
1. Open a Git repository in IntelliJ IDEA
2. Use Tools → Git Space Analyzer → Analyze Repository
3. Or use keyboard shortcut Ctrl+Shift+G
4. View results in the Git Space Analyzer tool window

## 📊 What It Analyzes

### Large Files
- Files above configurable size threshold (default: 1MB)
- File paths and sizes across all branches
- Which branches contain each large file
- Whether files exist in main branch

### Branch Analysis
- Remote vs local branches
- Unique content per branch
- Last commit dates
- Branch-specific large files

### Recommendations
- Files to remove from history
- Potential Git LFS candidates
- Binary artifacts that shouldn't be versioned
- Unused branches that can be deleted
- Estimated space savings

## 🔧 Configuration

### CLI Configuration
Create a `.gitspacerc.json` file in your repository:

```json
{
  "threshold": 1048576,
  "excludePatterns": [
    "node_modules/**",
    "*.log",
    "build/**",
    "dist/**"
  ],
  "maxResults": 100,
  "analyzeHistory": true
}
```

### VS Code Configuration
Add to your VS Code settings:

```json
{
  "gitSpaceAnalyzer.threshold": 1048576,
  "gitSpaceAnalyzer.excludePatterns": ["node_modules/**", "*.log"],
  "gitSpaceAnalyzer.autoAnalyzeOnOpen": false
}
```

## 🏗️ Development

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Java 11+ (for IntelliJ plugin)
- Gradle (for IntelliJ plugin)

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/git-space-analyzer.git
cd git-space-analyzer

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Development Workflow
```bash
# Core package development
cd packages/core
npm run dev

# VS Code extension development
cd packages/vscode-extension
npm run watch

# IntelliJ plugin development
cd packages/intellij-plugin
./gradlew runIde
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Git community for the amazing version control system
- VS Code and IntelliJ teams for excellent IDE platforms
- Open source contributors who make tools like this possible

## 🐛 Issues & Support

- Report bugs on [GitHub Issues](https://github.com/your-username/git-space-analyzer/issues)
- Ask questions in [Discussions](https://github.com/your-username/git-space-analyzer/discussions)
- Check existing issues before creating new ones

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

Made with ❤️ for developers who want cleaner, faster Git repositories.
