import os
import json
import logging
# pyrefly: ignore [missing-import]
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from pymongo.errors import ServerSelectionTimeoutError

# Configure logger
logger = logging.getLogger("bizpilot_db")
logging.basicConfig(level=logging.INFO)

# Database file for local fallback
DB_FILE = os.path.join(os.path.dirname(__file__), "data_db.json")

class JSONCollection:
    def __init__(self, db_instance, collection_name):
        self.db = db_instance
        self.name = collection_name

    def _get_data(self):
        return self.db._load_db().get(self.name, [])

    def _save_data(self, data):
        db_data = self.db._load_db()
        db_data[self.name] = data
        self.db._save_db(db_data)

    def find(self, query=None):
        query = query or {}
        data = self._get_data()
        results = []
        for doc in data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return results

    def find_one(self, query=None):
        query = query or {}
        data = self._get_data()
        for doc in data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def insert_one(self, document):
        # Enforce dict
        doc = dict(document)
        # Ensure _id or id exists
        if "id" not in doc and "_id" in doc:
            doc["id"] = doc["_id"]
        elif "id" not in doc:
            doc["id"] = str(hash(json.dumps(doc, default=str)))
        
        data = self._get_data()
        data.append(doc)
        self._save_data(data)
        return doc

    def update_one(self, query, update):
        data = self._get_data()
        modified = 0
        for doc in data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                # Apply $set update
                if "$set" in update:
                    for uk, uv in update["$set"].items():
                        doc[uk] = uv
                else:
                    for uk, uv in update.items():
                        doc[uk] = uv
                modified = 1
                break
        if modified:
            self._save_data(data)
        return modified

    def delete_one(self, query):
        data = self._get_data()
        idx_to_remove = -1
        for i, doc in enumerate(data):
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                idx_to_remove = i
                break
        if idx_to_remove != -1:
            data.pop(idx_to_remove)
            self._save_data(data)
            return 1
        return 0

    def delete_many(self, query=None):
        if query is None or query == {}:
            self._save_data([])
            return 0
        data = self._get_data()
        new_data = []
        deleted = 0
        for doc in data:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                deleted += 1
            else:
                new_data.append(doc)
        self._save_data(new_data)
        return deleted

    def count_documents(self, query=None):
        return len(self.find(query))


class JSONDatabase:
    def __init__(self):
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        if not os.path.exists(DB_FILE):
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _load_db(self):
        self._ensure_file_exists()
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_db(self, data):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    def __getattr__(self, name):
        return JSONCollection(self, name)


class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.use_mongo = False
        self.local_db = JSONDatabase()
        self._init_db()

    def _init_db(self):
        mongo_uri = os.getenv("DATABASE_URL", "mongodb://localhost:27017")
        try:
            logger.info("Attempting to connect to MongoDB...")
            # Set serverSelectionTimeoutMS to 1500ms
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
            # Try to list databases to verify connection
            self.client.list_database_names()
            self.db = self.client["bizpilot"]
            self.use_mongo = True
            logger.info("MongoDB connected successfully!")
        except (ServerSelectionTimeoutError, Exception) as e:
            logger.warn(f"Could not connect to MongoDB: {e}. Falling back to local JSON database.")
            self.use_mongo = False
            self.db = self.local_db

    def get_collection(self, name):
        if self.use_mongo:
            return self.db[name]
        else:
            return getattr(self.db, name)

# Global database manager instance
db_manager = DatabaseManager()

# Export collection objects
def get_collection(name):
    return db_manager.get_collection(name)
