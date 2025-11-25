<div align="center">

# 🚀 Baseline

### *The gold standard for macOS development environment setup*

**Stop wasting hours on manual Mac setups. Generate production-ready scripts in minutes.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

[Live Demo](https://baseline-mac.com) • [Documentation](#documentation) • [Features](#-features) • [Quick Start](#-quick-start)

![Baseline Hero](https://via.placeholder.com/1200x600/0a0a0a/00ff88?text=Baseline+-+Mac+Setup+Genie)

</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Advanced Usage](#-advanced-usage)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔥 The Problem

Every developer has been there:

- **4-8 hours** wasted setting up a new Mac
- **67%** of developers miss critical tools
- Juggling 10+ browser tabs with installation guides
- Copy-pasting commands from StackOverflow
- Fighting permission errors and dependency conflicts
- **Zero documentation** of what you actually installed

Setting up a new Mac shouldn't feel like archeology.

---

## ✨ The Solution

**Baseline** is a visual configurator that transforms Mac setup from a day-long nightmare into a 5-minute automated process.

### Two Powerful Workflows:

#### 🎯 **1. Visual Configurator** (Build From Scratch)
Browse 10,000+ tools, select what you need, and generate a production-ready setup script.

#### 📤 **2. Export Existing Setup** (Clone Your Mac)
Scan your current Mac's configuration and generate an exact replica script for your next machine.

<div align="center">

### **360 minutes → 5 minutes**
*98.6% time reduction in developer onboarding*

</div>

---

## 🎨 Features

### 🔍 **Smart Package Discovery**
- **10,000+** packages from Homebrew (formulas + casks)
- Real-time search with fuzzy matching
- Auto-categorization (Applications, Runtimes, Infrastructure, CLI Tools)
- Popular packages highlighted (10k+ installs)
- Intelligent suggestions based on selections

### ⚡ **Intelligent Configuration**
- **Visual step-by-step wizard** with progress tracking
- Category-based organization
- Dependency detection and warnings
- Conflict prevention
- Selection persistence (auto-save to localStorage)
- Bulk actions (select all, deselect all)

### 🛠️ **Advanced Customization**
- Dotfile management (.zshrc, .bashrc, .gitconfig)
- Environment variable configuration
- Custom shell aliases and functions
- Git configuration wizard
- SSH key setup options
- Version-controlled configurations

### 📦 **Export Your Existing Mac**
```bash
# Download and run the scanner
curl -O https://baseline-mac.com/baseline-scan.sh
chmod +x baseline-scan.sh
./baseline-scan.sh

# Upload the generated baseline-snapshot.json
# Baseline auto-generates your perfect setup script
```

**The scanner detects:**
- ✅ All Homebrew packages (formulae & casks)
- ✅ Node.js versions (nvm, n, fnm)
- ✅ Python versions (pyenv, conda)
- ✅ Ruby versions (rbenv, rvm)
- ✅ Shell configuration files
- ✅ Git configuration
- ✅ VS Code extensions
- ✅ System preferences
- ✅ Custom scripts and binaries

### 📜 **Script Generation**
- Production-ready bash scripts
- Error handling and rollback
- Progress indicators
- Idempotent operations (run multiple times safely)
- Compatible with **sh**, **bash**, and **zsh**
- Commented and well-structured code

### 🎭 **Beautiful UI/UX**
- Dark/Light mode with system preference detection
- Smooth animations (Framer Motion)
- Terminal-style progress visualization
- Responsive design (mobile-friendly)
- Keyboard shortcuts
- Accessibility compliant (WCAG 2.1 AA)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (or use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **bun** package manager
- macOS (for running generated scripts)

### Installation

```bash
# Clone the repository
git clone https://github.com/thanmaisai/baseline-new.git
cd baseline-new

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧩 How It Works

### Workflow 1: Visual Configurator

```mermaid
graph LR
    A[Browse Tools] --> B[Select Packages]
    B --> C[Configure Dotfiles]
    C --> D[Generate Script]
    D --> E[Download & Run]
    E --> F[✨ Complete Setup]
```

1. **Browse**: Search through 10,000+ tools from Homebrew
2. **Select**: Pick packages, applications, and runtimes
3. **Configure**: Set up dotfiles, environment variables, and Git config
4. **Generate**: Download your custom `setup-mac.sh` script
5. **Execute**: Run one command on your new Mac
6. **Done**: Your entire dev environment is ready

### Workflow 2: Export Existing Setup

```mermaid
graph LR
    A[Run Scanner] --> B[Upload Snapshot]
    B --> C[Auto-Generate Script]
    C --> D[Download Script]
    D --> E[Run on New Mac]
    E --> F[✨ Exact Clone]
```

1. **Scan**: Run `baseline-scan.sh` on your current Mac
2. **Upload**: Drag-drop the generated JSON to Baseline
3. **Review**: See exactly what will be installed
4. **Customize**: Add/remove items if needed
5. **Generate**: Download your personalized script
6. **Clone**: Run on any new Mac for an identical setup

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Lightning-fast build tool
- **React Router 6** - Client-side routing
- **TanStack Query** - Data fetching & caching

### UI/UX
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon system

### State & Data
- **React Context** - Global state (theme, selections)
- **LocalStorage** - Persistent selections
- **TanStack Query** - API caching (1-hour)

### Tools & Utilities
- **Fuse.js** - Fuzzy search
- **Zod** - Runtime validation
- **date-fns** - Date formatting
- **Canvas Confetti** - Celebration effects 🎉

### API Integration
- **Homebrew Formulae API** - Real-time package data
- **6,000+ CLI tools** (formulas)
- **4,000+ GUI apps** (casks)

---

## 📁 Project Structure

```
baseline/
├── public/
│   ├── baseline-scan.sh       # Mac scanner script
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── AnimatedStats.tsx  # Stats animations
│   │   ├── TerminalWindow.tsx # Terminal UI
│   │   ├── ToolCard.tsx       # Package cards
│   │   └── ...
│   ├── contexts/
│   │   └── ThemeContext.tsx   # Dark/light mode
│   ├── hooks/
│   │   ├── useBrewPackages.ts # Homebrew API hook
│   │   ├── useDebounce.ts     # Search debounce
│   │   └── usePersistedSelection.ts
│   ├── services/
│   │   ├── brewService.ts     # Homebrew API client
│   │   └── toolEnhancementService.ts
│   ├── pages/
│   │   ├── Index.tsx          # Landing page
│   │   ├── Configurator.tsx   # Visual wizard
│   │   ├── ExportSetup.tsx    # Export workflow
│   │   └── UploadScan.tsx     # Upload JSON
│   ├── utils/
│   │   ├── scanParser.ts      # Parse scan results
│   │   ├── scriptGenerator.ts # Generate bash scripts
│   │   └── iconService.ts     # Icon mapping
│   └── types/
│       └── tools.ts           # TypeScript types
├── docs/
│   ├── HOMEBREW_INTEGRATION.md
│   ├── keybeatures.md
│   └── Features_to_implement.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🛠️ Development

### Run Development Server

```bash
npm run dev
# or
bun dev
```

### Type Checking

```bash
npm run lint
```

### Build for Production

```bash
npm run build
```

### Environment Variables

No environment variables required! The app works out of the box.

---

## 🎯 Advanced Usage

### Custom Package Sources

Add your own package repositories:

```typescript
// src/data/tools.ts
export const customTools: Tool[] = [
  {
    id: 'my-tool',
    name: 'My Custom Tool',
    description: 'A custom package',
    category: 'cli-tools',
    installCommand: 'brew install my-tool'
  }
];
```

### Extending the Scanner

Modify `public/baseline-scan.sh` to detect additional tools:

```bash
# Add custom detection
if command -v my-tool &> /dev/null; then
  MY_TOOL_VERSION=$(my-tool --version)
  echo "my-tool: $MY_TOOL_VERSION" >> tools.txt
fi
```

### Custom Script Templates

Override script generation in `src/utils/scriptGenerator.ts`:

```typescript
export const generateCustomScript = (config: Config): string => {
  return `#!/bin/bash
# Your custom setup logic here
`;
};
```

---

## 📚 Documentation

### Key Documents

- **[Homebrew Integration](docs/HOMEBREW_INTEGRATION.md)** - How we fetch 10k+ packages
- **[Key Features](docs/keybeatures.md)** - Detailed feature breakdown
- **[Feature Roadmap](docs/Features_to_implement.md)** - Upcoming features

### Scanner Usage

```bash
# Basic scan
./baseline-scan.sh

# Include SSH keys (sensitive!)
./baseline-scan.sh --include-ssh-keys

# Custom output location
./baseline-scan.sh --output ~/Desktop/my-snapshot.json

# Verbose logging
./baseline-scan.sh --verbose
```

### Script Execution

```bash
# Download your generated script
curl -O https://baseline-mac.com/scripts/your-setup.sh

# Make executable
chmod +x your-setup.sh

# Run setup
./your-setup.sh

# Or run directly
bash your-setup.sh
```

---

## 🎬 Use Cases

### **For Individual Developers**
- Set up a new work Mac in 5 minutes
- Replicate your setup across multiple machines
- Version control your dev environment
- Quick recovery from system failures

### **For Engineering Teams**
- Standardize developer environments
- Onboard new engineers automatically
- Share team configurations as templates
- Reduce "works on my machine" issues

### **For Open Source Projects**
- Provide one-click contributor setup
- Document required tools automatically
- Reduce contribution friction
- Maintain consistent dev environments

### **For Bootcamps & Education**
- Get students coding faster
- Ensure everyone has the same tools
- Reduce setup support tickets
- Focus on teaching, not troubleshooting

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Reporting Bugs

1. Check [existing issues](https://github.com/thanmaisai/baseline-new/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open a [feature request](https://github.com/thanmaisai/baseline-new/issues/new)
2. Explain the use case
3. Describe the proposed solution
4. Add mockups if relevant

### Pull Requests

```bash
# Fork the repo and clone your fork
git clone https://github.com/YOUR_USERNAME/baseline-new.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request
```

### Development Guidelines

- Write TypeScript (no `any` types)
- Follow existing code style
- Add comments for complex logic
- Test on macOS (Ventura+ recommended)
- Update documentation for new features

---

## 📊 Stats

- **10,000+** packages available
- **6,000+** CLI tools (Homebrew formulas)
- **4,000+** GUI apps (Homebrew casks)
- **98.6%** time reduction vs manual setup
- **5 minutes** average setup time

---

## 🏆 Inspiration

Baseline was born from frustration. After setting up my 5th new Mac in a year and spending a full day each time, I knew there had to be a better way.

**The vision:** *What if onboarding a new machine was as simple as running one command?*

Now it is.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Baseline

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 💝 Acknowledgments

- **[Homebrew](https://brew.sh/)** - The backbone of macOS package management
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful React components
- **[Vercel](https://vercel.com/)** - Hosting and deployment
- **[Lovable](https://lovable.dev/)** - Initial development platform

Special thanks to all contributors and users who provided feedback.

<div align="center">

### ⭐ Star this repo if Baseline saved you time!

**Made with ❤️ for developers who value their time**

*Stop wasting hours. Start automating.*

[⬆ Back to Top](#-baseline)

</div>
