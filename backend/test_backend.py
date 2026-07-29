import os
import unittest
from fastapi.testclient import TestClient

# Adjust path to import app correctly
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import engine, Base, SessionLocal
from app import models, auth

class TestQMSBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # We will use the existing database for testing or configure a test db.
        # To avoid corrupting production, we can run test client directly.
        cls.client = TestClient(app)
        
        # Ensure default user is seeded (it is seeded in main.py, but let's double check)
        db = SessionLocal()
        user = db.query(models.User).filter(models.User.username == "qa_lead").first()
        if not user:
            hashed_pwd = auth.get_password_hash("Password123")
            user = models.User(
                username="qa_lead",
                hashed_password=hashed_pwd,
                role="QualityAssurance",
                full_name="QA Lead Investigator"
            )
            db.add(user)
            db.commit()
        db.close()

    def test_01_login_success(self):
        # Test auth login
        response = self.client.post("/api/auth/login", json={
            "username": "qa_lead",
            "password": "Password123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["username"], "qa_lead")
        
        # Save token for subsequent tests
        self.__class__.token = data["access_token"]

    def test_02_get_me(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.client.get("/api/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "qa_lead")

    def test_03_create_complaint(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        complaint_data = {
            "customer_name": "Test Customer",
            "company_name": "Test Hospital Pharmacy",
            "product_name": "Test Drug 100mg",
            "batch_number": "BAT12345X",
            "complaint_type": "Product Quality",
            "description": "The tablets in the blister pack appear to have chipped edges.",
            "summary": "Visual chipping defect reported on batch BAT12345X.",
            "severity": "Minor",
            "risk_level": "Low",
            "capa": "Quarantine stock, check BPR.",
            "status": "Open"
        }
        response = self.client.post("/api/complaints", json=complaint_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["customer_name"], "Test Customer")
        self.assertEqual(data["product_name"], "Test Drug 100mg")
        self.assertEqual(data["status"], "Open")
        self.__class__.complaint_id = data["id"]

    def test_04_get_complaints_list(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.client.get("/api/complaints", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.json()) > 0)

    def test_05_get_complaint_details(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.client.get(f"/api/complaints/{self.complaint_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.complaint_id)

    def test_06_add_risk_assessment(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        risk_data = {
            "severity_score": 3,
            "probability_score": 2,
            "rationale": "Moderate quality defect, low probability of recurrence."
        }
        response = self.client.post(f"/api/complaints/{self.complaint_id}/risk", json=risk_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["risk_priority_number"], 6)

    def test_07_dashboard_stats(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.client.get("/api/dashboard", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["total_complaints"] >= 1)
        self.assertTrue(data["risk_distribution"]["low"] >= 1)

    def test_08_ai_analyze_text(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        # Test direct text parsing fallback
        text_data = {
            "text": "Complaint from CVS Pharmacy. Product: Amoxicillin 250mg. Batch: AMX99281. The bottles were leaking."
        }
        response = self.client.post("/api/ai/analyze/text", json=text_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["product_name"], "Amoxicillin 250mg")
        self.assertEqual(data["batch_number"], "AMX99281")
        self.assertEqual(data["complaint_type"], "Product Quality")
        self.assertIn("root_cause", data)
        self.assertIn("suggested_investigation", data)
        self.assertIn("recommended_department", data)
        self.assertEqual(data["summary_confidence"], 98)

if __name__ == "__main__":
    unittest.main()
