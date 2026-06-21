import json
from pathlib import Path

KB_path= Path(__file__).parent.parent / "data" / "knowledge_base.json"

with open(KB_path, "r", encoding="utf-8") as f:
    KNOWLEDGE_BASE = json.load(f)


def search_knowledge_base(query: str, top_k:int=3)-> list[dict]:

    query_lower= query.lower()
    scored_entries = []

    for entry in KNOWLEDGE_BASE:
        score=0

        for keyword in entry["keywords"]:
            if keyword.lower() in query_lower:
                score+=1
        
        if score>0:
            scored_entries.append((score,entry))

    scored_entries.sort(key=lambda x: x[0], reverse=True)

    top_entries= [entry for score, entry in scored_entries[:top_k]]

    return top_entries


#results = search_knowledge_base("what fertilizer should I use for tomatoes")
#for r in results:
        #print(r["topic"], "-", r["content"][:60])

