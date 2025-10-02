# Drawing App Backend

Flask backend for the musical drawing application.

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Run the server:
\`\`\`bash
python app.py
\`\`\`

The server will start on `http://localhost:5000`

## API Endpoints

- `GET /api/drawings` - List all saved drawings
- `GET /api/drawings/<id>` - Get a specific drawing
- `POST /api/drawings` - Save a new drawing
- `DELETE /api/drawings/<id>` - Delete a drawing
- `GET /api/health` - Health check

## Data Format

Drawings are stored as JSON files with the following structure:

\`\`\`json
{
  "id": "20250102_143022_123456",
  "name": "My Drawing",
  "created_at": "2025-01-02T14:30:22.123456",
  "strokes": [
    {
      "points": [{"x": 100, "y": 150, "time": 0}, ...],
      "color": "#ff0000",
      "length": 250.5,
      "duration": 1500
    }
  ]
}
