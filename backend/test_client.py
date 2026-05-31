"""Run a quick in-process test of the /parse endpoint using FastAPI TestClient.
This avoids needing a running uvicorn process and is suitable for local smoke tests.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure project root is on sys.path so 'backend' package imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app

FAKE_PDF = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 72 720 Td (John Doe john@test.com) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000369 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
441
%%EOF"""


def run():
    client = TestClient(app)
    print("Testing POST /parse (in-process)...")
    resp = client.post(
        "/parse",
        files={"file": ("test_resume.pdf", FAKE_PDF, "application/pdf")},
        timeout=60,
    )
    print("Status:", resp.status_code)
    try:
        print(resp.json())
    except Exception:
        print(resp.text)


if __name__ == "__main__":
    run()
