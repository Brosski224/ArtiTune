# ArtiTune

A creative drawing-to-sound application that transforms your artistic strokes into musical compositions. Draw on the canvas and watch your art come alive with sound!

## Features

- **Interactive Drawing Canvas**: Draw freely on a responsive HTML5 canvas
- **Sound Generation**: Each stroke generates unique sounds based on:
  - Stroke length
  - Drawing speed
  - Stroke duration
  - Color/instrument selection
- **Multiple Instruments**: Choose from 5 different sound instruments:
  - 🔴 **Piano** (Red)
  - 🔵 **Synth** (Blue) 
  - 🟢 **Pluck** (Green)
  - 🟡 **Bell** (Yellow)
  - 🟣 **Pad** (Purple)
- **Replay System**: Watch and listen to your drawing being recreated with synchronized audio
- **Real-time Feedback**: See stroke count and live drawing updates

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **Audio**: Custom AudioEngine for sound generation
- **Canvas**: HTML5 Canvas API for drawing functionality
- **Icons**: Lucide React icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git

### Installation

#### Option 1: Clone from existing repository
```bash
git clone <your-repository-url>
cd artitune
```

#### Option 2: Set up from local directory
If you're starting from this local project:

1. Initialize git repository (if not already done):
```bash
git init
```

2. Create a new repository on GitHub/GitLab and add it as remote:
```bash
git remote add origin <your-repository-url>
```

3. Add and commit files:
```bash
git add .
git commit -m "Initial commit"
```

4. Push to remote repository:
```bash
git push -u origin main
```

#### Continue with setup:

5. Install dependencies:
```bash
npm install
# or
yarn install
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Select an Instrument**: Click on any colored circle to choose your instrument/sound
2. **Start Drawing**: Click and drag on the canvas to create strokes
3. **Listen**: Each stroke automatically generates sound based on your drawing characteristics
4. **Replay**: Click the "Replay" button to watch your entire composition recreated with audio
5. **Clear**: Use the "Clear" button to start fresh
6. **Stop**: Stop any ongoing replay with the "Stop" button

## Git Setup Commands

If you encounter the error "fatal: 'origin' does not appear to be a git repository":

1. Check current remotes:
```bash
git remote -v
```

2. Add your repository as origin:
```bash
git remote add origin https://github.com/yourusername/artitune.git
```

3. Push to set upstream:
```bash
git push -u origin main
```

## Project Structure

```
artitune/
├── components/
│   ├── ui/           # Reusable UI components
│   └── drawing-canvas.tsx  # Main drawing canvas component
├── lib/
│   ├── audio-engine.ts    # Audio generation logic
│   └── utils.ts          # Utility functions
└── README.md
```

## Key Components

- **DrawingCanvas**: Main component handling canvas interactions, stroke recording, and replay functionality
- **AudioEngine**: Manages sound generation and playback for different instruments
- **Stroke System**: Records drawing data including timing, position, and movement characteristics

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Future Enhancements

- [ ] Save and load drawings
- [ ] Export audio compositions
- [ ] More instrument types
- [ ] Collaborative drawing sessions
- [ ] Mobile touch support optimization
- [ ] Undo/Redo functionality

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Note**: This is a college project exploring the intersection of visual art and music through interactive technology.
