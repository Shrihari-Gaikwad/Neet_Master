import os
import shutil
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.syllabus import Subject, Unit, Chapter

# Mapping codes to Class & Subject
CODE_MAP = {
    "kebo": {"subject": "Biology", "grade": "Class 11"},
    "lebo": {"subject": "Biology", "grade": "Class 12"},
    "kech": {"subject": "Chemistry", "grade": "Class 11"},
    "lech": {"subject": "Chemistry", "grade": "Class 12"},
    "keph": {"subject": "Physics", "grade": "Class 11"},
    "leph": {"subject": "Physics", "grade": "Class 12"},
}

CHAPTER_NAMES = {
    "Class 11": {
        "Physics": {
            1: "Physical World", 2: "Units and Measurements", 3: "Motion in a Straight Line", 4: "Motion in a Plane", 5: "Laws of Motion", 6: "Work, Energy and Power", 7: "System of Particles and Rotational Motion", 8: "Gravitation", 9: "Mechanical Properties of Solids", 10: "Mechanical Properties of Fluids", 11: "Thermal Properties of Matter", 12: "Thermodynamics", 13: "Kinetic Theory", 14: "Oscillations", 15: "Waves"
        },
        "Chemistry": {
            1: "Some Basic Concepts of Chemistry", 2: "Structure of Atom", 3: "Classification of Elements and Periodicity in Properties", 4: "Chemical Bonding and Molecular Structure", 5: "States of Matter", 6: "Thermodynamics", 7: "Equilibrium", 8: "Redox Reactions", 9: "Hydrogen", 10: "The s-Block Elements", 11: "The p-Block Elements", 12: "Organic Chemistry: Some Basic Principles and Techniques", 13: "Hydrocarbons", 14: "Environmental Chemistry"
        },
        "Biology": {
            1: "The Living World", 2: "Biological Classification", 3: "Plant Kingdom", 4: "Animal Kingdom", 5: "Morphology of Flowering Plants", 6: "Anatomy of Flowering Plants", 7: "Structural Organisation in Animals", 8: "Cell: The Unit of Life", 9: "Biomolecules", 10: "Cell Cycle and Cell Division", 11: "Transport in Plants", 12: "Mineral Nutrition", 13: "Photosynthesis in Higher Plants", 14: "Respiration in Plants", 15: "Plant Growth and Development", 16: "Digestion and Absorption", 17: "Breathing and Exchange of Gases", 18: "Body Fluids and Circulation", 19: "Excretory Products and their Elimination", 20: "Locomotion and Movement", 21: "Neural Control and Coordination", 22: "Chemical Coordination and Integration"
        }
    },
    "Class 12": {
        "Physics": {
            1: "Electric Charges and Fields", 2: "Electrostatic Potential and Capacitance", 3: "Current Electricity", 4: "Moving Charges and Magnetism", 5: "Magnetism and Matter", 6: "Electromagnetic Induction", 7: "Alternating Current", 8: "Electromagnetic Waves", 9: "Ray Optics and Optical Instruments", 10: "Wave Optics", 11: "Dual Nature of Radiation and Matter", 12: "Atoms", 13: "Nuclei", 14: "Semiconductor Electronics"
        },
        "Chemistry": {
            1: "The Solid State", 2: "Solutions", 3: "Electrochemistry", 4: "Chemical Kinetics", 5: "Surface Chemistry", 6: "General Principles and Processes of Isolation of Elements", 7: "The p-Block Elements", 8: "The d- and f-Block Elements", 9: "Coordination Compounds", 10: "Haloalkanes and Haloarenes", 11: "Alcohols, Phenols and Ethers", 12: "Aldehydes, Ketones and Carboxylic Acids", 13: "Amines", 14: "Biomolecules", 15: "Polymers", 16: "Chemistry in Everyday Life"
        },
        "Biology": {
            1: "Reproduction in Organisms", 2: "Sexual Reproduction in Flowering Plants", 3: "Human Reproduction", 4: "Reproductive Health", 5: "Principles of Inheritance and Variation", 6: "Molecular Basis of Inheritance", 7: "Evolution", 8: "Human Health and Disease", 9: "Strategies for Enhancement in Food Production", 10: "Microbes in Human Welfare", 11: "Biotechnology: Principles and Processes", 12: "Biotechnology and its Applications", 13: "Organisms and Populations", 14: "Ecosystem", 15: "Biodiversity and Conservation", 16: "Environmental Issues"
        }
    }
}

def seed_books():
    db = SessionLocal()
    
    # Clean DB
    db.query(Chapter).delete()
    db.query(Unit).delete()
    db.query(Subject).delete()
    db.commit()

    # Subjects
    subjects = {}
    for sub_name in ["Physics", "Chemistry", "Biology"]:
        sub = Subject(name=sub_name)
        db.add(sub)
        db.commit()
        db.refresh(sub)
        subjects[sub_name] = sub

    source_dir = r"d:\neet qz\Books"
    dest_dir = r"d:\neet qz\neet\frontend\public\books"
    
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.endswith(".pdf"):
                base_name = os.path.splitext(file)[0].lower()
                
                if len(base_name) < 7:
                    continue
                    
                code = base_name[:4]
                if code not in CODE_MAP:
                    continue
                
                meta = CODE_MAP[code]
                subject_name = meta["subject"]
                grade = meta["grade"]
                
                part_or_unit = base_name[4]
                chapter_code = base_name[5:]
                
                if not chapter_code.isdigit():
                    continue
                
                chapter_num = int(chapter_code)
                
                # Logic for Unit name
                # Biology doesn't have parts/units, just "Complete Book" or "Biology"
                if subject_name == "Biology":
                    unit_name = "Complete Book"
                else:
                    unit_name = f"Part {part_or_unit}"
                
                # Find or create Unit
                unit = db.query(Unit).filter(Unit.name == unit_name, Unit.grade == grade, Unit.subject_id == subjects[subject_name].id).first()
                if not unit:
                    unit = Unit(name=unit_name, grade=grade, subject_id=subjects[subject_name].id)
                    db.add(unit)
                    db.commit()
                    db.refresh(unit)
                
                # Create Chapter Name
                ch_name_str = CHAPTER_NAMES.get(grade, {}).get(subject_name, {}).get(chapter_num, f"Chapter {chapter_num}")
                chapter_name = f"Chapter {chapter_num}: {ch_name_str}"
                
                pdf_rel_path = f"{subject_name}/{grade}/{unit_name}/chapter_{chapter_num}.pdf"
                pdf_abs_dest = os.path.join(dest_dir, subject_name, grade, unit_name)
                
                os.makedirs(pdf_abs_dest, exist_ok=True)
                shutil.copy2(os.path.join(root, file), os.path.join(pdf_abs_dest, f"chapter_{chapter_num}.pdf"))
                
                pdf_url = f"/books/{subject_name}/{grade}/{unit_name}/chapter_{chapter_num}.pdf"
                
                chapter = Chapter(name=chapter_name, unit_id=unit.id, pdf_url=pdf_url)
                db.add(chapter)
                db.commit()

    print("Books and syllabus successfully migrated!")
    db.close()

if __name__ == "__main__":
    seed_books()
