# Developer Guide

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.12.0
- npm >= 9.6.0
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd electron-angular-template

# Install dependencies
npm install

# Start development
npm start
```

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development server (Angular + Electron)
npm start

# Run in debug mode
npm run dev:debug

# Type checking across all packages
npm run typecheck

# Run linting
npm run lint

# Format code
npm run format
```

### Package-specific Development

```bash
# Work on main process only
cd packages/main && npm run serve

# Work on renderer (Angular) only
cd packages/renderer && npm start

# Work on shared utilities
cd packages/shared && npm run serve
```

### Testing

```bash
# Run all tests
npm test

# Run specific package tests
npm run test:main
npm run test:renderer
npm run test:shared
```

### Building

```bash
# Clean build
npm run clean

# Build for development
npm run build

# Build for production release
npm run release
```

## 🔧 VS Code Integration

### Recommended Extensions

The workspace includes recommended extensions for:

- TypeScript & Angular development
- Code formatting & linting
- Git integration
- Debugging support

### Keyboard Shortcuts

- `Ctrl+Shift+P` → Command Palette
- `F5` → Start debugging
- `Ctrl+Shift+T` → Run task
- `Ctrl+Shift+X` → Extensions

### Tasks Available

- 🚀 Start Development
- 🧪 Run All Tests
- 🔍 Run Linting
- 🎨 Format Code
- 📦 Build Production

## 🚨 Common Issues

### Node/NPM Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Electron Issues

```bash
# Rebuild electron dependencies
npm run postinstall
```

### Angular Issues

```bash
# Clear Angular cache
cd packages/renderer
ng cache clean
```

## 📁 Project Structure

```
📦 electron-angular-template/
├── 📁 packages/
│   ├── 📁 main/          # Electron main process
│   ├── 📁 renderer/      # Angular frontend
│   └── 📁 shared/        # Shared utilities
├── 📁 .vscode/           # VS Code configuration
├── 📁 .husky/            # Git hooks
└── 📄 package.json       # Root package configuration
```

## 🎯 Best Practices

### Commits

- Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
- Commits are automatically linted
- Code is automatically formatted on commit

### Code Quality

- ESLint runs on save
- Prettier formats on save
- TypeScript strict mode enabled
- Pre-commit hooks ensure quality

### Development

- Use absolute imports with path mapping
- Follow Angular style guide
- Use TypeScript strict mode
- Write tests for new features

## 🔗 Useful Links

- [Electron Documentation](https://electronjs.org/docs)
- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://typescriptlang.org/docs)
- [VS Code Tips & Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
