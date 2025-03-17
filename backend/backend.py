from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import paramiko
import json
import time
import re
import torch
import faiss
import numpy as np
import pickle
import os
from transformers import BertTokenizer, BertModel

# I added this
torch.set_num_threads(1)  # Limit CPU threads to reduce memory issues
device = torch.device("cpu")  # Force CPU usage


os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For students intending to use the bolt server with PyLucene Installed
SSH_HOST = "bolt.cs.ucr.edu"
SSH_USER = "" # Change this to your username
SSH_PASSWORD = "" # Change this to your password
SEARCH_SCRIPT_PATH = "~/PyLuceneIndexing/search_with_extra.py"




###=============================FAISS TESTING====================================###





index = faiss.read_index("faiss_index.bin")

# metadata loading
with open('filtered_embeddings.pkl', 'rb') as f:
    filtered_data = pickle.load(f)

titles = [entry['title'] for entry in filtered_data]
passages = [entry['passage'] for entry in filtered_data]

# BERT tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def run_faiss_search(query: str, top_k):
    with torch.no_grad():
        query_embedding = torch.mean(
            model(**tokenizer(query, return_tensors="pt", padding=True, truncation=True))[0],
            dim=1
        ).numpy().astype(np.float32)
    print (f"query embdedded")
    distances, indices = index.search(query_embedding, top_k)

    print (f"index searched")
    results = []
    for i in range(len(indices[0])):
        idx = indices[0][i]
        results.append({
            "rank": i+1,
            "title": titles[idx],
            "url": f"https://en.wikipedia.org/wiki/{titles[idx].replace(' ', '_')}",
            "snippet": passages[idx],
            "distance": float(distances[0][i])
        })
    
    return results




###=============================FAISS TESTING====================================###





def run_remote_search(query: str, top_k: int):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(SSH_HOST, username=SSH_USER, password=SSH_PASSWORD, allow_agent=False, look_for_keys=False)

        print("SSH Connected Successfully!")

        #starts shell to SSH into server#
        shell = ssh.invoke_shell()
        print("Interactive shell started!")

        #runs cs242_login command#
        shell.send("cs242_login\n")
        time.sleep(1)

        #runs search_with_extra.py#
        shell.send(f'python3 ~/PyLuceneIndexing/search_with_extra.py "{query}"\n')
        time.sleep(2)

        shell.send("exit\n")

        output = ""
        while True:
            if shell.recv_ready():
                output += shell.recv(4096).decode("utf-8")
            else:
                break
            time.sleep(0.5)

        ssh.close()

        print(f"Full Shell Output:\n{output}")

        json_match = re.search(r"\[\s*{.*}\s*\]", output, re.DOTALL)
        if not json_match:
            return {"error": "JSON extraction failed", "raw_output": output}

        json_output = json_match.group(0).strip()

        print(f"Final Extracted JSON:\n{json_output}")

        results = json.loads(json_output)
        top_k_results = results[:top_k]
        return top_k_results

    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON output: {str(e)}", "raw_output": output}
    except Exception as e:
        return {"error": str(e)}
    







###=================================================================###



###@app.get("/api/search")
###async def search(request: Request, q: str = Query(..., title="Search Query")):
###    print(f"RAW REQUEST: {await request.body()}")
###    print(f"Received query: {q}")

###    if not q:
###        return JSONResponse(content={"error": "Query parameter is missing!"}, status_code=400)

###    results = run_remote_search(q)

###    if isinstance(results, dict) and "error" in results:
###        return JSONResponse(content=results, status_code=500)

###    print(f"Sending JSON Response: {results}")

###    return JSONResponse(content=results, status_code=200)






###=================================================================###


@app.get("/api/search")
async def search(request: Request, q: str = Query(..., title="Search Query"), index_type: str = Query(..., title="Index Type"), top_k: int = Query(..., title="Number of Results") ):
    print(f"Received query: {q}, Index Type: {index_type}, Top K: {top_k}")

    if not q:
        return JSONResponse(content={"error": "Query parameter is missing!"}, status_code=400)
    
    #checks which index is used, calls proper search function#
    if index_type.lower() == "bert":
        print ("Running bert query")
        results = run_faiss_search(q, top_k)
    else:
        print ("Running pyLucene query")
        results = run_remote_search(q, top_k)

    print (f"Query processed")
    ###results = run_remote_search(q)

    if isinstance(results, dict) and "error" in results:
        return JSONResponse(content=results, status_code=500)

    return JSONResponse(content=results, status_code=200)