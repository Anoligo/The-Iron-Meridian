# Iron Meridian Campaign Tracker

A comprehensive campaign management tool for Pathfinder 2e, designed to help GMs and players track their adventures, characters, items, and world details in one place.

## Features

- **Dashboard**: Overview of your campaign's current state
- **Quests**: Track main and side quests, including status and related entities
- **Characters**: Manage player characters and NPCs with detailed profiles
- **Locations**: Keep track of important places in your world
- **Loot & Inventory**: Manage items, equipment, and treasure
- **Factions**: Track organizations and their relationships
- **Notes**: Keep session notes and world lore organized
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Easy on the eyes during long gaming sessions

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/iron-meridian-tracker.git
   cd iron-meridian-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality

### Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
│   ├── ui/          # Base UI components
│   └── layout/      # Layout components
├── features/        # Feature modules
│   ├── dashboard/   # Dashboard feature
│   ├── quests/      # Quest management
│   └── ...          # Other features
├── lib/             # Utility functions and services
├── stores/          # State management
├── styles/          # Global styles and variables
└── App.tsx          # Main application component
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [SCSS](https://sass-lang.com/)
- Icons by [Lucide](https://lucide.dev/)
