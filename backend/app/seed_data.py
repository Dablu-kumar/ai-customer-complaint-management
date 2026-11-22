import hashlib
import json
import datetime
from app.database import SessionLocal
from app import models, auth as auth_utils

def seed_enterprise_data():
    db = SessionLocal()
    try:
        # 1. Seed Enterprise Users
        users_to_seed = [
            {
                "username": "qa_lead",
                "password": "Password123",
                "role": "QualityAssurance",
                "full_name": "Dr. Elena Rostova",
                "email": "elena.rostova@aivoa-pharma.com"
            },
            {
                "username": "investigator_1",
                "password": "Password123",
                "role": "Investigator",
                "full_name": "Dr. Marcus Vance",
                "email": "marcus.vance@aivoa-pharma.com"
            },
            {
                "username": "intake_clerk",
                "password": "Password123",
                "role": "IntakeSpecialist",
                "full_name": "Alex Rivera",
                "email": "alex.rivera@aivoa-pharma.com"
            },
            {
                "username": "auditor_ext",
                "password": "Password123",
                "role": "Auditor",
                "full_name": "Inspector Jonathan Hayes (FDA/EMA)",
                "email": "j.hayes@fda.gov.reg"
            }
        ]

        seeded_users = {}
        for u_data in users_to_seed:
            user = db.query(models.User).filter(models.User.username == u_data["username"]).first()
            if not user:
                hashed_pwd = auth_utils.get_password_hash(u_data["password"])
                user = models.User(
                    username=u_data["username"],
                    hashed_password=hashed_pwd,
                    role=u_data["role"],
                    full_name=u_data["full_name"],
                    email=u_data["email"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            seeded_users[u_data["username"]] = user

        # 2. Seed Demo Complaint Records if database has fewer than 2 complaints
        complaint_count = db.query(models.Complaint).count()
        if complaint_count < 2:
            now = datetime.datetime.utcnow()

            # Record 1: Serious Adverse Event with MedDRA coding (15-Day Alert Active)
            five_whys_1 = json.dumps([
                {"why_number": 1, "question": "Why did patient experience acute urticaria and dizziness after dose?", "answer": "Suspected unexpected hypersensitivity reaction triggered by excipient trace allergen."},
                {"why_number": 2, "question": "Why was trace excipient allergen present?", "answer": "Cross-contamination occurred in shared fluid bed granulator FB-02."},
                {"why_number": 3, "question": "Why did cross-contamination occur?", "answer": "CIP (Clean-in-place) automated swab TOC verification failed to detect insoluble residual binder."},
                {"why_number": 4, "question": "Why did the swab protocol fail to detect binder?", "answer": "Cleaning validation protocol CV-2023-09 used an ethanol rinse rather than alkaline detergent wash."},
                {"why_number": 5, "question": "Why was an inappropriate solvent specified in CV-2023-09?", "answer": "ROOT CAUSE: Inadequate chemical solubility matrix assessment during tech-transfer cleaning validation."}
            ])
            fishbone_1 = json.dumps({
                "man": "Cleaning validation scientist did not evaluate pKa solubility curve.",
                "machine": "Fluid bed granulator FB-02 internal spray nozzles had shadowing dead-legs.",
                "method": "Cleaning validation SOP CV-2023-09 specified non-polar solvent rinse.",
                "material": "Polyvinylpyrrolidone K-30 binder batch met USP monograph.",
                "measurement": "TOC swab analytical threshold was set above target insoluble limit.",
                "milieu": "Granulation suite Class D cleanroom operated at 21°C."
            })

            c1 = models.Complaint(
                customer_name="Dr. Sarah Jenkins, MD",
                company_name="Mount Sinai Health System",
                product_name="Lipitor 20mg Tablets",
                batch_number="LPT-88910B",
                complaint_type="Safety/Adverse Event",
                description="Patient reported severe acute urticaria, rash, facial swelling, and dizziness within 45 minutes of taking Lipitor 20mg Tablet from lot LPT-88910B. Patient was treated in the Emergency Department with IV diphenhydramine and hydrocortisone. Symptoms resolved within 4 hours. Retain blister pack retained for QC testing.",
                summary="Acute hypersensitivity and urticaria requiring ED intervention following Lipitor 20mg ingestion.",
                severity="Critical",
                risk_level="High",
                capa="1. Immediately quarantine remaining inventory of batch LPT-88910B.\n2. Revise Cleaning SOP-CLN-088 to mandate dual-cycle 0.1M NaOH wash.\n3. Execute 100% TOC and HPLC trace allergen swab verification across Granulator FB-02.",
                status="CAPA",
                assigned_to="Dr. Marcus Vance",
                priority="High",
                root_cause="Cross-contamination trace excipient residue in Granulator FB-02 due to inadequate alkaline wash in tech-transfer cleaning protocol.",
                suggested_investigation="Perform immediate retain sample HPLC assay, audit FB-02 cleaning logs, and initiate 15-Day FDA MedWatch 3500A expedited notification.",
                recommended_department="Pharmacovigilance & Safety",
                summary_confidence=99,
                risk_confidence=98,
                extraction_confidence=99,
                complaint_date=(now - datetime.timedelta(days=4)).strftime("%Y-%m-%d"),
                mfg_date="2025-09-15",
                exp_date="2027-09-15",
                country="United States",
                attachment_name="Hospital_Adverse_Event_Intake_Form.pdf",
                ndc_code="0069-4200-30",
                meddra_terms="Hypersensitivity [10020751] (SOC: Immune system disorders), Dizziness [10013573] (SOC: Nervous system disorders)",
                adverse_event_flag=1,
                patient_age="61 Y",
                patient_gender="Female",
                five_whys_json=five_whys_1,
                fishbone_json=fishbone_1,
                capa_due_date=(now + datetime.timedelta(days=14)).strftime("%Y-%m-%d"),
                capa_owner="Dr. Elena Rostova",
                effectiveness_check_date=(now + datetime.timedelta(days=60)).strftime("%Y-%m-%d"),
                effectiveness_criteria="Zero allergen residue swabs (<0.01 ppm) on 10 consecutive granulation runs.",
                effectiveness_status="PENDING",
                created_at=now - datetime.timedelta(days=4)
            )
            db.add(c1)
            db.commit()
            db.refresh(c1)

            # Add Electronic Signatures for Record 1
            sig1_hash = hashlib.sha256(f"{c1.id}:1:elena.rostova:Intake Approval:OPEN:UNDER REVIEW:{now.isoformat()}".encode()).hexdigest()
            sig1 = models.ElectronicSignature(
                complaint_id=c1.id,
                user_id=seeded_users["qa_lead"].id,
                signer_name="Dr. Elena Rostova",
                signer_role="QualityAssurance",
                action="Status Change",
                status_from="OPEN",
                status_to="UNDER REVIEW",
                meaning_of_signature="I approve the preliminary clinical review and initiate 15-day expedited safety triage.",
                signature_hash=sig1_hash,
                timestamp=now - datetime.timedelta(days=4, hours=2)
            )
            db.add(sig1)

            sig2_hash = hashlib.sha256(f"{c1.id}:2:marcus.vance:Investigation Sign-off:UNDER REVIEW:CAPA:{now.isoformat()}".encode()).hexdigest()
            sig2 = models.ElectronicSignature(
                complaint_id=c1.id,
                user_id=seeded_users["investigator_1"].id,
                signer_name="Dr. Marcus Vance",
                signer_role="Investigator",
                action="Status Change",
                status_from="UNDER REVIEW",
                status_to="CAPA",
                meaning_of_signature="I certify the completion of the 5-Whys Root Cause Analysis and authorize the CAPA remediation plan.",
                signature_hash=sig2_hash,
                timestamp=now - datetime.timedelta(days=2)
            )
            db.add(sig2)

            # Record 2: Packaging Blister Defect (Amoxicillin) - Certified Closed with complete e-signatures
            five_whys_2 = json.dumps([
                {"why_number": 1, "question": "Why were capsules reported crushed inside the blister pocket?", "answer": "Pocket sealing station pressure exceeded validated limit by 15%."},
                {"why_number": 2, "question": "Why was sealing pressure out of specification?", "answer": "Servo motor encoder feedback signal suffered electrical noise spike."},
                {"why_number": 3, "question": "Why did electrical noise spike occur?", "answer": "Ground shielding wire on servo driver cable was frayed from mechanical friction."},
                {"why_number": 4, "question": "Why was cable wear not caught during maintenance?", "answer": "Monthly checklist did not specify cable track flex-radius inspection."},
                {"why_number": 5, "question": "Why was flex-radius inspection omitted?", "answer": "ROOT CAUSE: Packaging machine OEM preventative maintenance update bulletin #112 was never integrated into plant PM database."}
            ])
            fishbone_2 = json.dumps({
                "man": "Maintenance technician followed legacy PM checklist without OEM revision #112.",
                "machine": "Blister thermoforming line #4 sealing servo drive cable wear.",
                "method": "Plant SOP-MAINT-104 lacked formal OEM bulletin reconciliation workflow.",
                "material": "Alu-foil and PVC roll stock fully compliant with mechanical gauge specs.",
                "measurement": "Load cell sensor was accurate but received intermittent dirty encoder feedback.",
                "milieu": "Packaging hall Class D suite humidity at 45% RH."
            })

            c2 = models.Complaint(
                customer_name="Robert Miller, Head of Pharmacy",
                company_name="Walgreens Pharmacy #1042",
                product_name="Amoxicillin 500mg Capsules",
                batch_number="AMX-2026-44A",
                complaint_type="Packaging/Labeling",
                description="Pharmacy received two cartons of Amoxicillin 500mg where 4 out of 10 blister strips had cracked foil backing and crushed gelatin capsules with loose amoxicillin powder inside cartons. No patient exposure occurred.",
                summary="Cracked blister cavities and damaged gelatin capsules from lot AMX-2026-44A.",
                severity="Minor",
                risk_level="Low",
                capa="1. Replaced servo encoder cable with heavy-duty flex-shielded harness on Line #4.\n2. Updated PM SOP-MAINT-104 with OEM bulletin #112 inspection criteria.\n3. Executed 100% visual inspection on retain lot samples.",
                status="CLOSED",
                assigned_to="Dr. Elena Rostova",
                priority="Low",
                root_cause="Servo motor encoder cable friction wear causing pressure spike, compounded by omission of OEM PM bulletin #112 in maintenance SOP.",
                suggested_investigation="Review Line #4 mechanical logs, replace cable harness, and verify 500-cycle sealing repeatability.",
                recommended_department="Packaging Maintenance QA",
                summary_confidence=98,
                risk_confidence=97,
                extraction_confidence=99,
                complaint_date=(now - datetime.timedelta(days=12)).strftime("%Y-%m-%d"),
                mfg_date="2025-10-01",
                exp_date="2027-10-01",
                country="United States",
                attachment_name="Damaged_Blister_Inspection_Photo.jpg",
                ndc_code="0093-2264-01",
                meddra_terms="Product physical issue [10069110] (SOC: Product issues)",
                adverse_event_flag=0,
                patient_age="N/A",
                patient_gender="N/A",
                five_whys_json=five_whys_2,
                fishbone_json=fishbone_2,
                capa_due_date=(now - datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
                capa_owner="Maintenance Lead Eng. David Kim",
                effectiveness_check_date=(now - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
                effectiveness_criteria="Zero blister pocket crushing in 100,000 units packaged.",
                effectiveness_status="VERIFIED_EFFECTIVE",
                created_at=now - datetime.timedelta(days=12)
            )
            db.add(c2)
            db.commit()
            db.refresh(c2)

            # Record 2 Closure Signature
            sig_close_hash = hashlib.sha256(f"{c2.id}:1:elena.rostova:Final Closure:VERIFICATION:CLOSED:{now.isoformat()}".encode()).hexdigest()
            sig_close = models.ElectronicSignature(
                complaint_id=c2.id,
                user_id=seeded_users["qa_lead"].id,
                signer_name="Dr. Elena Rostova",
                signer_role="QualityAssurance",
                action="Status Change",
                status_from="VERIFICATION",
                status_to="CLOSED",
                meaning_of_signature="I officially certify closure of this complaint under cGMP and FDA 21 CFR Part 11 guidelines. CAPA verified effective.",
                signature_hash=sig_close_hash,
                timestamp=now - datetime.timedelta(days=1)
            )
            db.add(sig_close)

            # Audit log for closure
            audit_close = models.AuditLog(
                complaint_id=c2.id,
                user_id=seeded_users["qa_lead"].id,
                action="21 CFR Part 11 Signature",
                description="Status advanced 'VERIFICATION' -> 'CLOSED'. Meaning: 'I officially certify closure of this complaint under cGMP and FDA 21 CFR Part 11 guidelines. CAPA verified effective.'. Signed by Dr. Elena Rostova (QualityAssurance).",
                signature_hash=sig_close_hash,
                timestamp=now - datetime.timedelta(days=1)
            )
            db.add(audit_close)
            db.commit()

        print("[Seed] Enterprise pharmaceutical data successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {str(e)}")
    finally:
        db.close()
