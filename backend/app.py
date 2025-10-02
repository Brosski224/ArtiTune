from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Directory to store drawings
DRAWINGS_DIR = 'drawings'
os.makedirs(DRAWINGS_DIR, exist_ok=True)

@app.route('/api/drawings', methods=['GET'])
def list_drawings():
    """List all saved drawings"""
    try:
        drawings = []
        for filename in os.listdir(DRAWINGS_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(DRAWINGS_DIR, filename)
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    drawings.append({
                        'id': filename[:-5],  # Remove .json extension
                        'name': data.get('name', 'Untitled'),
                        'created_at': data.get('created_at'),
                        'stroke_count': len(data.get('strokes', []))
                    })
        
        # Sort by creation date, newest first
        drawings.sort(key=lambda x: x['created_at'], reverse=True)
        return jsonify({'drawings': drawings})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drawings/<drawing_id>', methods=['GET'])
def get_drawing(drawing_id):
    """Get a specific drawing by ID"""
    try:
        filepath = os.path.join(DRAWINGS_DIR, f'{drawing_id}.json')
        if not os.path.exists(filepath):
            return jsonify({'error': 'Drawing not found'}), 404
        
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drawings', methods=['POST'])
def save_drawing():
    """Save a new drawing"""
    try:
        data = request.json
        
        # Generate unique ID based on timestamp
        drawing_id = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        
        # Add metadata
        drawing_data = {
            'id': drawing_id,
            'name': data.get('name', 'Untitled Drawing'),
            'created_at': datetime.now().isoformat(),
            'strokes': data.get('strokes', [])
        }
        
        # Save to file
        filepath = os.path.join(DRAWINGS_DIR, f'{drawing_id}.json')
        with open(filepath, 'w') as f:
            json.dump(drawing_data, f, indent=2)
        
        return jsonify({
            'success': True,
            'id': drawing_id,
            'message': 'Drawing saved successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/drawings/<drawing_id>', methods=['DELETE'])
def delete_drawing(drawing_id):
    """Delete a drawing"""
    try:
        filepath = os.path.join(DRAWINGS_DIR, f'{drawing_id}.json')
        if not os.path.exists(filepath):
            return jsonify({'error': 'Drawing not found'}), 404
        
        os.remove(filepath)
        return jsonify({
            'success': True,
            'message': 'Drawing deleted successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
