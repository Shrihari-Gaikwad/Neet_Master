import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.syllabus import Subject, Chapter, Topic

# Strict NCERT Syllabus Structure (Class 11 & Class 12)
SYLLABUS = {
    "Biology": {
        "Class 11": [
            {"name": "The Living World", "topics": ["What is Living?", "Diversity in the Living World", "Taxonomic Categories"]},
            {"name": "Biological Classification", "topics": ["Kingdom Monera", "Kingdom Protista", "Kingdom Fungi", "Viruses, Viroids, Prions"]},
            {"name": "Plant Kingdom", "topics": ["Algae", "Bryophytes", "Pteridophytes", "Gymnosperms"]},
            {"name": "Animal Kingdom", "topics": ["Basis of Classification", "Classification of Animals"]},
            {"name": "Morphology of Flowering Plants", "topics": ["The Root", "The Stem", "The Leaf", "The Flower", "The Fruit"]},
            {"name": "Cell: The Unit of Life", "topics": ["What is a Cell?", "Cell Theory", "Prokaryotic Cells", "Eukaryotic Cells"]},
            {"name": "Biomolecules", "topics": ["How to Analyze Chemical Composition?", "Primary and Secondary Metabolites", "Proteins", "Nucleic Acids"]},
            {"name": "Human Physiology: Breathing and Exchange of Gases", "topics": ["Respiratory Organs", "Mechanism of Breathing", "Exchange of Gases", "Transport of Gases"]}
        ],
        "Class 12": [
            {"name": "Sexual Reproduction in Flowering Plants", "topics": ["Flower - A Fascinating Organ of Angiosperms", "Pre-fertilisation: Structures and Events", "Double Fertilisation", "Post-fertilisation: Structures and Events"]},
            {"name": "Human Reproduction", "topics": ["The Male Reproductive System", "The Female Reproductive System", "Gametogenesis", "Menstrual Cycle", "Fertilisation and Implantation"]},
            {"name": "Reproductive Health", "topics": ["Reproductive Health - Problems and Strategies", "Population Stabilisation and Birth Control", "Medical Termination of Pregnancy (MTP)"]},
            {"name": "Principles of Inheritance and Variation", "topics": ["Mendel's Laws of Inheritance", "Inheritance of One Gene", "Inheritance of Two Genes", "Sex Determination"]},
            {"name": "Evolution", "topics": ["Origin of Life", "Evolution of Life Forms - A Theory", "What are the Evidences for Evolution?", "Adaptive Radiation"]},
            {"name": "Human Health and Disease", "topics": ["Common Diseases in Humans", "Immunity", "AIDS", "Cancer", "Drugs and Alcohol Abuse"]},
            {"name": "Biotechnology: Principles and Processes", "topics": ["Principles of Biotechnology", "Tools of Recombinant DNA Technology", "Processes of Recombinant DNA Technology"]}
        ]
    },
    "Physics": {
        "Class 11": [
            {"name": "Units and Measurements", "topics": ["The International System of Units", "Measurement of Length, Mass and Time", "Accuracy, Precision of Instruments and Errors in Measurement", "Significant Figures"]},
            {"name": "Motion in a Straight Line", "topics": ["Position, Path Length and Displacement", "Average Velocity and Average Speed", "Instantaneous Velocity and Speed", "Acceleration"]},
            {"name": "Laws of Motion", "topics": ["Aristotle's Fallacy", "The Law of Inertia", "Newton's First Law of Motion", "Newton's Second Law of Motion", "Newton's Third Law of Motion"]},
            {"name": "Work, Energy and Power", "topics": ["Notions of Work and Kinetic Energy", "Work", "Kinetic Energy", "Work-Energy Theorem", "Concept of Potential Energy"]}
        ],
        "Class 12": [
            {"name": "Electric Charges and Fields", "topics": ["Electric Charge", "Conductors and Insulators", "Charging by Induction", "Basic Properties of Electric Charge", "Coulomb's Law", "Electric Field"]},
            {"name": "Electrostatic Potential and Capacitance", "topics": ["Electrostatic Potential", "Potential due to a Point Charge", "Potential due to an Electric Dipole", "Equipotential Surfaces", "Capacitors and Capacitance"]},
            {"name": "Current Electricity", "topics": ["Electric Current", "Electric Currents in Conductors", "Ohm's law", "Drift of Electrons and the Origin of Resistivity", "Limitations of Ohm's Law"]},
            {"name": "Moving Charges and Magnetism", "topics": ["Magnetic Force", "Motion in a Magnetic Field", "Magnetic Field due to a Current Element, Biot-Savart Law", "Ampere's Circuital Law"]}
        ]
    },
    "Chemistry": {
        "Class 11": [
            {"name": "Some Basic Concepts of Chemistry", "topics": ["Importance of Chemistry", "Nature of Matter", "Properties of Matter and their Measurement", "Uncertainty in Measurement", "Laws of Chemical Combinations", "Dalton's Atomic Theory"]},
            {"name": "Structure of Atom", "topics": ["Discovery of Sub-atomic Particles", "Atomic Models", "Developments Leading to the Bohr's Model of Atom", "Bohr's Model for Hydrogen Atom", "Quantum Mechanical Model of Atom"]},
            {"name": "Classification of Elements and Periodicity", "topics": ["Why do we need to Classify Elements?", "Genesis of Periodic Classification", "Modern Periodic Law and the present form of the Periodic Table", "Electronic Configurations of Elements and the Periodic Table"]},
            {"name": "Chemical Bonding and Molecular Structure", "topics": ["Kössel-Lewis Approach to Chemical Bonding", "Ionic or Electrovalent Bond", "Bond Parameters", "The Valence Shell Electron Pair Repulsion (VSEPR) Theory", "Valence Bond Theory"]}
        ],
        "Class 12": [
            {"name": "Solutions", "topics": ["Types of Solutions", "Expressing Concentration of Solutions", "Solubility", "Vapour Pressure of Liquid Solutions", "Ideal and Non-ideal Solutions", "Colligative Properties and Determination of Molar Mass"]},
            {"name": "Electrochemistry", "topics": ["Electrochemical Cells", "Galvanic Cells", "Nernst Equation", "Conductance of Electrolytic Solutions", "Electrolytic Cells and Electrolysis", "Batteries", "Fuel Cells", "Corrosion"]},
            {"name": "Chemical Kinetics", "topics": ["Rate of a Chemical Reaction", "Factors Influencing Rate of a Reaction", "Integrated Rate Equations", "Pseudo First Order Reaction", "Temperature Dependence of the Rate of a Reaction", "Collision Theory of Chemical Reactions"]},
            {"name": "The d- and f- Block Elements", "topics": ["Position in the Periodic Table", "Electronic Configurations of the d-Block Elements", "General Properties of the Transition Elements (d-Block)", "Some Important Compounds of Transition Elements", "The Lanthanoids", "The Actinoids"]}
        ]
    }
}

def seed_database():
    db = SessionLocal()
    try:
        # Clear existing data so we have a clean NCERT DB
        print("Clearing old syllabus data...")
        db.query(Topic).delete()
        db.query(Chapter).delete()
        db.query(Subject).delete()
        db.commit()

        for subj_name, grades in SYLLABUS.items():
            print(f"Adding Subject: {subj_name}")
            subject = Subject(name=subj_name)
            db.add(subject)
            db.commit()
            db.refresh(subject)

            for grade_name, chapters in grades.items():
                for chap_data in chapters:
                    print(f"  -> Adding Chapter: {chap_data['name']} ({grade_name})")
                    chapter = Chapter(
                        name=chap_data["name"],
                        grade=grade_name,
                        subject_id=subject.id
                    )
                    db.add(chapter)
                    db.commit()
                    db.refresh(chapter)

                    for topic_name in chap_data.get("topics", []):
                        # print(f"    -> Adding Topic: {topic_name}")
                        topic = Topic(name=topic_name, chapter_id=chapter.id)
                        db.add(topic)
                
            db.commit()
        print("Strict NCERT Syllabus seeding complete!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
