import json
from pathlib import Path

KB_path= Path(__file__).parent.parent / "data" / "knowledge_base.json"

with open(KB_path, "r", encoding="utf-8") as f:
    KNOWLEDGE_BASE = json.load(f)


def search_knowledge_base(query: str, top_k:int=3)-> list[dict]:

    query_lower= query.lower()
    scored_entries = []

    for entry in KNOWLEDGE_BASE:
        

