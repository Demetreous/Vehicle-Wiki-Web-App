import sys
import faiss
import torch
import numpy as np
import pickle
from transformers import BertTokenizer, BertModel
from transformers import DistilBertTokenizer, DistilBertModel # I added this

torch.set_num_threads(1)  # Limit CPU threads to reduce memory issues
device = torch.device("cpu")  # Force CPU usage



# BERT tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# I added this model
#tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
#model = DistilBertModel.from_pretrained('distilbert-base-uncased')

index = faiss.read_index("faiss_index.bin")

# Metadata loading
with open('filtered_embeddings.pkl', 'rb') as f:
    filtered_data = pickle.load(f)

titles = [entry['title'] for entry in filtered_data]
passages = [entry['passage'] for entry in filtered_data]

def get_top_k_results(query, top_k=5):
    with torch.no_grad():
        query_embedding = torch.mean(model(**tokenizer(query, return_tensors="pt", padding=True, truncation=True))[0], dim=1).numpy().astype(np.float32)
    
    distances, indices = index.search(query_embedding, top_k)
    
    results = []
    for i in range(len(indices[0])):
        idx = indices[0][i]
        results.append(f"\nRank {i+1}:\nTitle: {titles[idx]}\nPassage: {passages[idx]}\nDistance: {distances[0][i]}\n{'-' * 50}")
    
    return "\n".join(results)

if len(sys.argv) < 2:
    print("Usage: python search_faiss.py '<your query>'")
    sys.exit(1)

query = sys.argv[1]
print(get_top_k_results(query, top_k=5))
