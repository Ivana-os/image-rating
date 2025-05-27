from flask import Flask, request, jsonify, send_from_directory
import psycopg2
import os
from datetime import datetime

app = Flask(__name__, static_url_path='', static_folder='.')

# PostgreSQL konekcija
conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
cursor = conn.cursor()

# Kreiraj tablicu ako ne postoji
cursor.execute("""
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    image_index INTEGER,
    time TIMESTAMP,
    folder1 INTEGER,
    folder2 INTEGER,
    folder3 INTEGER
)
""")
conn.commit()

# Glavna stranica
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Endpoint za statične datoteke (script.js, style.css)
@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)

# API za spremanje ocjena
@app.route('/rate', methods=['POST'])
def rate():
    data = request.get_json()
    index = data.get('index')
    ratings = data.get('ratings', {})
    now = datetime.now()

    cursor.execute("""
        INSERT INTO ratings (image_index, time, folder1, folder2, folder3)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        index,
        now,
        ratings.get('folder1'),
        ratings.get('folder2'),
        ratings.get('folder3')
    ))
    conn.commit()
    return jsonify(message="Ocjena spremljena u bazu")

if __name__ == '__main__':
    app.run(debug=True)
