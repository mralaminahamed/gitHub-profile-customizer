# GitHub Profile Customizer

A modern browser extension built with Vue 3, TypeScript, and Vite that allows you to customize your GitHub profile interface.

## Development

### Prerequisites
- Node.js (v18 or higher)
- Yarn (v4.1.0 or higher)

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/github-profile-customizer.git

# Navigate to the project directory
cd github-profile-customizer

# Enable Corepack (for Yarn 4.x)
corepack enable

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Build
```bash
# Production build
yarn build

# Create extension zip
yarn build:zip
```

### Lint & Format
```bash
# Run ESLint
yarn lint

# Format code
yarn fmt
```

### Development Scripts
- `yarn dev` - Start development with hot reload
- `yarn build` - Build for production
- `yarn type-check` - Run TypeScript type checking
- `yarn lint` - Lint the code
- `yarn fmt` - Format code with Prettier
- `yarn start` - Run the extension locally
- `yarn serve` - Preview production build

## Project Structure
```
github-profile-customizer/
├── src/                    # Source code
│   ├── contentScripts/     # Content scripts
│   ├── background/         # Service worker
│   ├── popup/             # Popup UI
│   ├── options/           # Options page
│   ├── components/        # Shared components
│   ├── composables/       # Vue composables
│   └── types/             # TypeScript types
├── public/                # Static assets
├── scripts/               # Build scripts
├── dist/                  # Built files
└── ...config files
```

## Features
- GitHub profile customization
- Organization visibility control
- Activity and contribution settings
- Real-time preview
- Settings sync
- Modern UI with Vue 3
- Type-safe with TypeScript

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
MIT License