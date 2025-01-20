import os
import cherrypy
import sqlite3
import json

DB_FILE = "notes.db"


def initialize_db():
    """Initialize the SQLite database and create required tables."""
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        # Create notes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                hidden_words TEXT DEFAULT '[]'
            )
        ''')
        conn.commit()


class SimpleNote:
    @cherrypy.expose
    def index(self):
        with open('index.html', 'r') as html_file:
            return html_file.read()

    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def add_note(self):
        """Add a note to the database."""
        input_json = cherrypy.request.json
        note = input_json['note']

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO notes (content) VALUES (?)", (note,))
            conn.commit()
            note_id = cursor.lastrowid

        return {"id": note_id, "note": note}

    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def hide_word(self):
        """Hide a word from a note and store it in the hidden_words array."""
        input_json = cherrypy.request.json
        note_id = input_json['note_id']
        word_to_hide = input_json['word']

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            # Get the note and hidden words
            cursor.execute("SELECT content, hidden_words FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()
            if not row:
                return {"error": "Note not found"}
            
            content, hidden_words = row
            words = content.split()
            if word_to_hide not in words:
                return {"error": "Word not found in the note"}

            # Remove the word from the content
            words.remove(word_to_hide)
            updated_content = ' '.join(words)
            
            # Update hidden words
            hidden_words = json.loads(hidden_words)
            hidden_words.append(word_to_hide)

            # Save updated content and hidden words
            cursor.execute("""
                UPDATE notes
                SET content = ?, hidden_words = ?
                WHERE id = ?
            """, (updated_content, json.dumps(hidden_words), note_id))
            conn.commit()

        return {"note_id": note_id, "updated_content": updated_content, "hidden_words": hidden_words}


    @cherrypy.expose
    @cherrypy.tools.json_out()
    def get_hidden_words(self, note_id):
        """Retrieve hidden words for a specific note."""
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT hidden_words FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()
            if not row:
                return {"error": "Note not found"}
            hidden_words = json.loads(row[0]) if row[0] else []

        return {"note_id": note_id, "hidden_words": hidden_words}
    

    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    def restore_word(self):
        """Restore a word from hidden_words back to the note's content."""
        input_json = cherrypy.request.json
        note_id = input_json['note_id']
        word_to_restore = input_json['word']

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            # Fetch the note and hidden words
            cursor.execute("SELECT content, hidden_words FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()
            if not row:
                return {"error": "Note not found"}

            content, hidden_words = row
            hidden_words = json.loads(hidden_words)

            if word_to_restore not in hidden_words:
                return {"error": "Word not found in hidden words"}

            # Remove the word from hidden_words and restore it to the content
            hidden_words.remove(word_to_restore)
            updated_content = f"{content} {word_to_restore}".strip()

            # Update the database
            cursor.execute("""
                UPDATE notes
                SET content = ?, hidden_words = ?
                WHERE id = ?
            """, (updated_content, json.dumps(hidden_words), note_id))
            conn.commit()

        return {"note_id": note_id, "updated_content": updated_content, "hidden_words": hidden_words}




if __name__ == '__main__':
    initialize_db()
    conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/static': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'static'
        }
    }
    cherrypy.quickstart(SimpleNote(), '/', conf)



