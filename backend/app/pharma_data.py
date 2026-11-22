"""
Pharma Standard Reference Directory:
1. FDA National Drug Code (NDC) Directory
2. MedDRA (Medical Dictionary for Regulatory Activities) SOC/PT Terms
"""

# FDA NDC Catalog for common pharmaceutical products
FDA_NDC_CATALOG = [
    {
        "ndc_code": "0093-2264-01",
        "product_name": "Amoxicillin 500mg Capsules",
        "active_ingredient": "Amoxicillin Trihydrate",
        "strength": "500 mg",
        "dosage_form": "Capsule",
        "route": "Oral",
        "manufacturer": "Teva Pharmaceuticals USA, Inc."
    },
    {
        "ndc_code": "0093-3147-01",
        "product_name": "Amoxicillin 250mg Capsules",
        "active_ingredient": "Amoxicillin Trihydrate",
        "strength": "250 mg",
        "dosage_form": "Capsule",
        "route": "Oral",
        "manufacturer": "Teva Pharmaceuticals USA, Inc."
    },
    {
        "ndc_code": "0074-3799-13",
        "product_name": "Humira 40mg/0.8mL Pen",
        "active_ingredient": "Adalimumab",
        "strength": "40 mg / 0.8 mL",
        "dosage_form": "Injection, Solution",
        "route": "Subcutaneous",
        "manufacturer": "AbbVie Inc."
    },
    {
        "ndc_code": "0069-4200-30",
        "product_name": "Lipitor 20mg Tablets",
        "active_ingredient": "Atorvastatin Calcium",
        "strength": "20 mg",
        "dosage_form": "Tablet, Film Coated",
        "route": "Oral",
        "manufacturer": "Pfizer Laboratories Div Pfizer Inc"
    },
    {
        "ndc_code": "0069-4210-30",
        "product_name": "Lipitor 40mg Tablets",
        "active_ingredient": "Atorvastatin Calcium",
        "strength": "40 mg",
        "dosage_form": "Tablet, Film Coated",
        "route": "Oral",
        "manufacturer": "Pfizer Laboratories Div Pfizer Inc"
    },
    {
        "ndc_code": "0002-3228-30",
        "product_name": "Prozac 20mg Pulvules",
        "active_ingredient": "Fluoxetine Hydrochloride",
        "strength": "20 mg",
        "dosage_form": "Capsule",
        "route": "Oral",
        "manufacturer": "Eli Lilly and Company"
    },
    {
        "ndc_code": "0173-0682-20",
        "product_name": "Ventolin HFA 90mcg Inhalation Aerosol",
        "active_ingredient": "Albuterol Sulfate",
        "strength": "108 mcg (equivalent to 90 mcg base)",
        "dosage_form": "Aerosol, Metered",
        "route": "Respiratory (Inhalation)",
        "manufacturer": "GlaxoSmithKline LLC"
    },
    {
        "ndc_code": "50090-0012-0",
        "product_name": "Metformin HCl 500mg Tablets",
        "active_ingredient": "Metformin Hydrochloride",
        "strength": "500 mg",
        "dosage_form": "Tablet, Extended Release",
        "route": "Oral",
        "manufacturer": "A-S Medication Solutions"
    },
    {
        "ndc_code": "0006-0740-31",
        "product_name": "Januvia 100mg Tablets",
        "active_ingredient": "Sitagliptin Phosphate",
        "strength": "100 mg",
        "dosage_form": "Tablet, Film Coated",
        "route": "Oral",
        "manufacturer": "Merck Sharp & Dohme Corp."
    },
    {
        "ndc_code": "50458-578-30",
        "product_name": "Xarelto 20mg Tablets",
        "active_ingredient": "Rivaroxaban",
        "strength": "20 mg",
        "dosage_form": "Tablet, Film Coated",
        "route": "Oral",
        "manufacturer": "Janssen Pharmaceuticals, Inc."
    }
]

# MedDRA Common Terms Catalog (SOC: System Organ Class, PT: Preferred Term, Code)
MEDDRA_TERMS_CATALOG = [
    {
        "soc": "Gastrointestinal disorders",
        "pt": "Nausea",
        "code": "10028813",
        "keywords": ["nausea", "sick to stomach", "queasy", "upset stomach"]
    },
    {
        "soc": "Gastrointestinal disorders",
        "pt": "Vomiting",
        "code": "10047700",
        "keywords": ["vomiting", "threw up", "throwing up", "emesis"]
    },
    {
        "soc": "Gastrointestinal disorders",
        "pt": "Dyspepsia",
        "code": "10013946",
        "keywords": ["dyspepsia", "heartburn", "indigestion", "acid reflux", "burning stomach"]
    },
    {
        "soc": "Immune system disorders",
        "pt": "Anaphylactic reaction",
        "code": "10002198",
        "keywords": ["anaphylaxis", "severe allergic", "throat closed", "anaphylactic", "respiratory distress"]
    },
    {
        "soc": "Immune system disorders",
        "pt": "Hypersensitivity",
        "code": "10020751",
        "keywords": ["allergy", "allergic", "hives", "rash", "urticaria", "itching", "pruritus"]
    },
    {
        "soc": "Nervous system disorders",
        "pt": "Dizziness",
        "code": "10013573",
        "keywords": ["dizziness", "dizzy", "lightheaded", "vertigo", "spinning"]
    },
    {
        "soc": "Nervous system disorders",
        "pt": "Headache",
        "code": "10019211",
        "keywords": ["headache", "migraine", "head pain"]
    },
    {
        "soc": "Cardiac disorders",
        "pt": "Tachycardia",
        "code": "10043071",
        "keywords": ["tachycardia", "rapid heart", "palpitations", "racing heart"]
    },
    {
        "soc": "General disorders and administration site conditions",
        "pt": "Drug inefficacy",
        "code": "10070744",
        "keywords": ["inefficacy", "not working", "no effect", "did not work", "therapeutic response decreased"]
    },
    {
        "soc": "Product issues",
        "pt": "Product physical issue",
        "code": "10069110",
        "keywords": ["chipped", "broken", "cracked", "discoloration", "powder loose", "crumbling", "empty blister"]
    },
    {
        "soc": "Product issues",
        "pt": "Product packaging issue",
        "code": "10077536",
        "keywords": ["packaging", "seal broken", "leaking", "bottle broken", "missing cap", "foil punctured"]
    },
    {
        "soc": "Product issues",
        "pt": "Product label issue",
        "code": "10077537",
        "keywords": ["label", "misprint", "smudged expiry", "wrong font", "insert missing", "bar code illegible"]
    },
    {
        "soc": "Product issues",
        "pt": "Foreign matter present",
        "code": "10065095",
        "keywords": ["foreign matter", "particle", "black speck", "glass particle", "hair", "fiber"]
    }
]

def find_ndc_for_product(product_name: str):
    if not product_name:
        return None
    name_lower = product_name.lower()
    for item in FDA_NDC_CATALOG:
        prod_short = item["product_name"].lower().split()[0]
        if prod_short in name_lower or item["product_name"].lower() in name_lower:
            return item
    return None

def detect_meddra_terms(narrative: str):
    if not narrative:
        return []
    narrative_lower = narrative.lower()
    matched = []
    for item in MEDDRA_TERMS_CATALOG:
        for kw in item["keywords"]:
            if kw in narrative_lower:
                matched.append(f"{item['pt']} [{item['code']}] (SOC: {item['soc']})")
                break
    return matched
