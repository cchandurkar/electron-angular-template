# Contributing to Electron Angular Template

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 22.12.0 to 24.0.0
- **npm**: Version 9.6.0 or higher
- **TypeScript**: Version 5.8.0 or higher
- **Git**: Latest version

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/electron-angular-template.git
   cd electron-angular-template
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Workflow

### Code Standards

We follow strict code standards to maintain consistency:

- **TypeScript**: All code must be written in TypeScript
- **ESLint**: Code must pass ESLint checks
- **Prettier**: Code must be formatted with Prettier
- **Type Safety**: No `any` types unless absolutely necessary

### Before Committing

Run these commands to ensure your code meets our standards:

```bash
# Type check all packages
npm run typecheck

# Lint and fix issues
npm run lint:fix

# Format code
npm run format

# Build all packages
npm run build

# Run tests
npm run test
```

### Package-Specific Development

#### Working on Renderer (`packages/renderer`)

```bash
npm run app:serve # Angular dev server
npm run app:build # Build Angular project with Production target
```

#### Working on Main Process (`packages/main`)

```bash
npm run electron:serve # Launches electron in DEV mode with hot-reload
npm run electron:build # Build app using electron-builder
```

#### Working on Shared Utilities (`packages/shared`)

```bash
npm run shared:build  # Build JS files
```

## 🏗️ Architecture Guidelines

### File Organization

```
packages/
│
├── main/
│   ├── src/
│   │   ├── preload/
│   │   │   ├── index.ts       # Preload script
│   │   │   └── index.d.ts     # Preload script types
│   │   │
│   │   ├── index.ts           # Entry point
│   │   ├── window.ts          # Window management
│   │   └── ipc.ts             # IPC Handles
│   │
├── renderer/
│   ├── src/
│   │   ├── app/
│   │   │   ├── assets/        # Icons, images, styles, themes
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # Angular services
│   │   │   ├── models/        # Data models
│   │   │   └── utils/         # Utilities
│   │   │
└── shared/
    ├── src/
    │   ├── index.ts           # Main exports
    │   ├── types/             # Shared types
    │   ├── utils/             # Shared utilities
    │   └── constants/         # Constants
```

### Naming Conventions

- **Files**: kebab-case (`my-component.ts`)
- **Classes**: PascalCase (`MyComponent`)
- **Functions/Variables**: camelCase (`myFunction`)
- **Constants**: SCREAMING_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces**: PascalCase with 'I' prefix (`IMyInterface`)
- **Types**: PascalCase (`MyType`)

### Import Guidelines

```typescript
// 1. Node modules
import { app } from 'electron';
import { Component } from '@angular/core';

// 2. Shared utilities
import { MyUtility } from '@shared/utils';

// 3. Local imports
import { MyService } from './my-service';
import { MyComponent } from '../components/my-component';
```

## 🧪 Testing Guidelines

### Writing Tests

- Write unit tests for all new functionality
- Place test files next to the code they test
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### Test File Naming

- Unit tests: `*.spec.ts`
- Integration tests: `*.integration.spec.ts`
- E2E tests: `*.e2e.spec.ts`

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
npm run test:main
npm run test:renderer
npm run test:shared
```

## 📝 Commit Guidelines

### Commit Message Format

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(main): add window management service
fix(renderer): resolve component loading issue
docs(readme): update installation instructions
test(shared): add utility function tests
```

## 🔍 Code Review Process

### Pull Request Guidelines

1. **Title**: Use descriptive titles
2. **Description**: Explain what and why
3. **Testing**: Include testing instructions
4. **Screenshots**: Add screenshots for UI changes
5. **Breaking Changes**: Document any breaking changes

### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

## 🛠️ Development Tools

### Recommended VS Code Extensions

The project includes recommended extensions in `.vscode/extensions.json`:

- **Essential**: ESLint, Prettier, TypeScript
- **Angular**: Angular Language Service
- **Electron**: Electron support
- **Utilities**: Path IntelliSense, Auto Rename Tag

### VS Code Settings

The workspace includes optimized settings for:

- Auto-formatting on save
- ESLint integration
- TypeScript support
- Debugging configurations

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, include:

1. **Environment**: OS, Node.js version, npm version
2. **Steps to Reproduce**: Clear, numbered steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Logs**: Relevant error messages or logs

### Feature Requests

When requesting features:

1. **Use Case**: Describe why this feature is needed
2. **Proposed Solution**: How you envision it working
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

## 📚 Resources

### Documentation

- [Electron Documentation](https://electronjs.org/docs)
- [Angular Documentation](https://angular.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Project Structure

- [Monorepo Guidelines](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## 💬 Questions and Support

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Email**: For private inquiries

Thank you for contributing to make this project better! 🎉
