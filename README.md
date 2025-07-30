# Electron Angular Template

A modern, well-structured Electron application template with Angular frontend and TypeScript support. This template uses a monorepo structure with separate packages for main process, renderer process, and shared utilities.

## 🏗️ Architecture

```
electron-angular-template/
├── packages/
│   ├── main/          # Electron main process
│   ├── renderer/      # Angular frontend application
│   └── shared/        # Shared utilities and types
├── .vscode/           # VS Code workspace settings
├── dist/              # Build output
└── README.md
```

### Package Structure

- **`packages/main`**: Electron main process with TypeScript support
- **`packages/renderer`**: Angular application for the UI
- **`packages/shared`**: Shared TypeScript utilities, types, and constants

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.12.0 <= 24.0.0
- npm >= 9.6.0
- TypeScript >= 5.8.0

### Installation

```bash
# Clone the repository
git clone https://github.com/cchandurkar/electron-angular-template.git
cd electron-angular-template

# Install dependencies for all packages
npm install
```

### Development

```bash
# Start development servers for both renderer and main process
npm start

# Start individual packages
npm run app:serve      # Start Angular dev server
npm run electron:serve # Start Electron main process
npm run electron:start # Start Electron without dev server
```

### Building

```bash
# Build all packages
npm run build

# Build individual packages
npm run shared:build   # Build shared utilities
npm run app:build      # Build Angular app
npm run electron:build # Build Electron app
```

## 🛠️ Available Scripts

### Root Level Commands

| Command                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `npm start`            | Start development mode (Angular + Electron) |
| `npm run build`        | Build all packages                          |
| `npm run clean`        | Clean all build artifacts                   |
| `npm run lint`         | Lint all packages                           |
| `npm run lint:fix`     | Fix linting issues in all packages          |
| `npm run format`       | Format code with Prettier                   |
| `npm run format:check` | Check code formatting                       |
| `npm run test`         | Run tests in all packages                   |
| `npm run typecheck`    | Type-check all packages                     |

### Package-Specific Commands

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run shared:build`   | Build shared package               |
| `npm run app:serve`      | Start Angular development server   |
| `npm run app:build`      | Build Angular application          |
| `npm run electron:serve` | Start Electron in development mode |
| `npm run electron:start` | Start Electron application         |
| `npm run electron:build` | Build Electron application         |

## 📁 Project Structure

```
electron-angular-template/
├── packages/
│   ├── main/
│   │   ├── src/
│   │   │   ├── index.ts           # Main process entry point
│   │   │   ├── window.ts          # Window management
│   │   │   └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── app/               # Angular application
│   │   │   ├── assets/            # Static assets
│   │   │   └── ...
│   │   ├── angular.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/
│       ├── src/
│       │   ├── index.ts           # Shared exports
│       │   ├── types/             # Type definitions
│       │   ├── utils/             # Utility functions
│       │   └── constants/         # Constants
│       ├── package.json
│       └── tsconfig.json
├── .vscode/
│   ├── settings.json              # VS Code settings
│   ├── tasks.json                 # Build tasks
│   ├── launch.json                # Debug configurations
│   └── extensions.json            # Recommended extensions
├── .editorconfig                  # Editor configuration
├── .prettierrc                    # Prettier configuration
├── .prettierignore               # Prettier ignore patterns
├── eslint.config.js              # ESLint configuration
├── tsconfig.json                 # Root TypeScript configuration
├── package.json                  # Root package configuration
└── README.md
```

## 🔧 Development Tools

### VS Code Integration

This template includes comprehensive VS Code configuration:

- **Auto-formatting** with Prettier on save
- **Linting** with ESLint
- **TypeScript** support with path mapping
- **Debugging** configurations for both main and renderer processes
- **Tasks** for building, testing, and cleaning
- **Extensions** recommendations for optimal development experience

### Code Quality

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **TypeScript**: Type checking across all packages
- **EditorConfig**: Consistent editor settings

### Build System

- **TypeScript Project References**: Fast incremental builds
- **Workspace**: NPM workspace for dependency management
- **Path Mapping**: Simplified imports between packages

## 🎯 Features

- ✅ **Modern Stack**: Electron + Angular + TypeScript
- ✅ **Monorepo Structure**: Organized with npm workspaces
- ✅ **Hot Reload**: Development with live reloading
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Code Quality**: ESLint + Prettier configuration
- ✅ **VS Code Integration**: Comprehensive workspace settings
- ✅ **Debugging**: Ready-to-use debug configurations
- ✅ **Build Optimization**: Incremental builds and caching

## 📚 Development Guidelines

### Adding New Dependencies

```bash
# Add to specific package
cd packages/main && npm install <package>
cd packages/renderer && npm install <package>
cd packages/shared && npm install <package>

# Add development tools to root
npm install -D <dev-package>
```

### Import Patterns

```typescript
// Import from shared package
import { MyUtility } from '@shared/utils';

// Import from other packages (if needed)
import { MainService } from '@main/services';
```

### Code Organization

- Place shared utilities in `packages/shared`
- Keep Electron-specific code in `packages/main`
- Angular components and services in `packages/renderer`
- Use TypeScript project references for cross-package imports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Desktop app framework
- [Angular](https://angular.io/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
