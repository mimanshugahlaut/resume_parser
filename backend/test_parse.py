"""Quick end-to-end test of the /parse endpoint."""
import sys
import requests

# Minimal valid PDF bytes (readable by pdfplumber)
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

print("Testing POST http://localhost:8000/parse ...")
try:
    resp = requests.post(
        "http://localhost:8000/parse",
        files={"file": ("test_resume.pdf", FAKE_PDF, "application/pdf")},
        timeout=60,
    )
    print(f"Status: {resp.status_code}")
    if resp.ok:
        data = resp.json()
        print("SUCCESS!")
        print(f"  Name:   {data.get('name')}")
        print(f"  Email:  {data.get('email')}")
        print(f"  Skills: {data.get('skills')}")
        print(f"  ID:     {data.get('id')}")
    else:
        print(f"FAILED: {resp.text}")
except requests.exceptions.ConnectionError:
    print("CONNECTION ERROR - is the backend running on port 8000?")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
