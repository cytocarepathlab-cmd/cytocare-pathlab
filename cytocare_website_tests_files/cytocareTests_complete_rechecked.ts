export type CytocareTest = {
  id: string;
  category: string;
  name: string;
  vial: string;
  price: number;
  reportingTime: string;
  sourcePage: number;
};

export const cytocareTests: CytocareTest[] = [
  {
    "id": "abo-rh-blood-grouping-001",
    "category": "Hematology",
    "name": "ABO & RH (BLOOD GROUPING)",
    "vial": "PURPLE - EDTA",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "bt-ct-002",
    "category": "Hematology",
    "name": "BT CT",
    "vial": "",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "cbc-complete-blood-counts-003",
    "category": "Hematology",
    "name": "CBC - COMPLETE BLOOD COUNTS",
    "vial": "PURPLE - EDTA",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "cbc-esr-hemograme-004",
    "category": "Hematology",
    "name": "CBC + ESR - HEMOGRAME",
    "vial": "PURPLE - EDTA",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "pbs-peripheral-blood-smear-comments-005",
    "category": "Hematology",
    "name": "PBS - (Peripheral blood Smear) - Comments",
    "vial": "PURPLE - EDTA",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "esr-006",
    "category": "Hematology",
    "name": "ESR",
    "vial": "BLACK",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hemoglobin-hb-007",
    "category": "Hematology",
    "name": "HEMOGLOBIN (HB%)",
    "vial": "PURPLE - EDTA",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "malaria-parasite-peripheral-smear-bsmp-008",
    "category": "Hematology",
    "name": "MALARIA PARASITE (PERIPHERAL SMEAR) - BSMP",
    "vial": "PURPLE - EDTA",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "malaria-card-antigen-test-009",
    "category": "Hematology",
    "name": "MALARIA CARD ANTIGEN TEST",
    "vial": "PURPLE - EDTA",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "sickling-test-010",
    "category": "Hematology",
    "name": "SICKLING TEST",
    "vial": "PURPLE - EDTA",
    "price": 400,
    "reportingTime": "48 hrs",
    "sourcePage": 1
  },
  {
    "id": "platelet-count-011",
    "category": "Hematology",
    "name": "PLATELET COUNT",
    "vial": "PURPLE - EDTA",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "prothrombin-time-with-inr-pt-inr-012",
    "category": "Hematology",
    "name": "PROTHROMBIN TIME WITH INR (PT INR)",
    "vial": "SKY",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "aptt-plasma-013",
    "category": "Hematology",
    "name": "APTT, PLASMA",
    "vial": "SKY",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "reticulocyte-count-014",
    "category": "Hematology",
    "name": "RETICULOCYTE COUNT",
    "vial": "PURPLE - EDTA",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "aso-anti-streptolysin-o-quantitative-015",
    "category": "Serology",
    "name": "ASO (ANTI STREPTOLYSIN O) - QUANTITATIVE",
    "vial": "RED - PLAIN",
    "price": 450,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "crp-c-reactive-protein-quantitative-016",
    "category": "Serology",
    "name": "CRP (C-REACTIVE PROTEIN) - QUANTITATIVE",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "ra-factor-quantitative-017",
    "category": "Serology",
    "name": "RA FACTOR - QUANTITATIVE",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "chikungunya-card-test-rapid-018",
    "category": "Serology",
    "name": "CHIKUNGUNYA CARD TEST (RAPID)",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "dengue-card-test-ns1-igg-igm-019",
    "category": "Serology",
    "name": "DENGUE CARD TEST (NS1 + IGG + IGM)",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hiv-i-ii-card-test-020",
    "category": "Serology",
    "name": "HIV I & II Card Test",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hbsag-australia-antigen-card-test-021",
    "category": "Serology",
    "name": "HBSAG (AUSTRALIA ANTIGEN) Card Test",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hcv-hepatitis-c-antibody-card-test-022",
    "category": "Serology",
    "name": "HCV (HEPATITIS C ANTIBODY) Card Test",
    "vial": "RED - PLAIN",
    "price": 450,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hbsag-elisa-method-023",
    "category": "Serology",
    "name": "HBSAG - ELISA Method",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hiv-i-ii-elisa-method-024",
    "category": "Serology",
    "name": "HIV I & II - ELISA Method",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "hcv-elisa-method-025",
    "category": "Serology",
    "name": "HCV - ELISA Method",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "mantoux-tuberculin-test-026",
    "category": "Serology",
    "name": "MANTOUX (TUBERCULIN TEST)",
    "vial": "10 TU / 5 TU",
    "price": 200,
    "reportingTime": "48 to 72 Hrs",
    "sourcePage": 1
  },
  {
    "id": "microfilaria-card-test-027",
    "category": "Serology",
    "name": "MICROFILARIA CARD TEST",
    "vial": "PURPLE / RED",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "microfilaria-antigen-elisa-method-028",
    "category": "Serology",
    "name": "MICROFILARIA ANTIGEN - ELISA Method",
    "vial": "PURPLE / RED",
    "price": 1500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "h-pylori-card-test-029",
    "category": "Serology",
    "name": "H PYLORI CARD TEST",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "h-pylori-igg-iga-test-030",
    "category": "Serology",
    "name": "H PYLORI IGG IGA TEST",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "vdrl-test-031",
    "category": "Serology",
    "name": "VDRL TEST",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "typhi-dot-igg-igm-032",
    "category": "Serology",
    "name": "TYPHI DOT IGG IGM",
    "vial": "RED - PLAIN",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "widal-test-033",
    "category": "Serology",
    "name": "WIDAL TEST",
    "vial": "RED - PLAIN",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "stool-routine-examination-034",
    "category": "Clinical Pathology",
    "name": "STOOL ROUTINE EXAMINATION",
    "vial": "CONTAINER",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "stool-for-occult-blood-035",
    "category": "Clinical Pathology",
    "name": "STOOL FOR OCCULT BLOOD",
    "vial": "CONTAINER",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "semen-analysis-colletion-at-lab-only-036",
    "category": "Clinical Pathology",
    "name": "SEMEN ANALYSIS - Colletion at Lab Only",
    "vial": "CONTAINER",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-bile-salt-pigment-037",
    "category": "Clinical Pathology",
    "name": "URINE BILE SALT / PIGMENT",
    "vial": "CONTAINER",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-for-ketone-bodies-038",
    "category": "Clinical Pathology",
    "name": "URINE FOR KETONE BODIES",
    "vial": "CONTAINER",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-pregnancy-test-039",
    "category": "Clinical Pathology",
    "name": "URINE PREGNANCY TEST",
    "vial": "CONTAINER",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-routine-examination-040",
    "category": "Clinical Pathology",
    "name": "URINE ROUTINE EXAMINATION",
    "vial": "CONTAINER",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-culture-susceptibility-041",
    "category": "Clinical Pathology",
    "name": "URINE CULTURE & SUSCEPTIBILITY",
    "vial": "CONTAINER",
    "price": 300,
    "reportingTime": "48 Hrs",
    "sourcePage": 1
  },
  {
    "id": "urine-r-e-c-s-042",
    "category": "Clinical Pathology",
    "name": "URINE R/E & C/S",
    "vial": "CONTAINER",
    "price": 400,
    "reportingTime": "48 Hrs",
    "sourcePage": 1
  },
  {
    "id": "urine-sugar-043",
    "category": "Clinical Pathology",
    "name": "URINE SUGAR",
    "vial": "CONTAINER",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-protein-24-hrs-044",
    "category": "Clinical Pathology",
    "name": "URINE PROTEIN 24 HRS",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-24-hrs-for-acid-fast-bacilli-045",
    "category": "Clinical Pathology",
    "name": "URINE 24 HRS FOR ACID FAST BACILLI",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-albumin-microalbumin-a-c-ratio-spot-046",
    "category": "Clinical Pathology",
    "name": "URINE ALBUMIN / MICROALBUMIN A/C RATIO-SPOT",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-protein-047",
    "category": "Clinical Pathology",
    "name": "URINE PROTEIN",
    "vial": "CONTAINER",
    "price": 100,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 1
  },
  {
    "id": "urine-protein-creatinine-ratio-spot-24-hrs-048",
    "category": "Clinical Pathology",
    "name": "URINE PROTEIN CREATININE RATIO (SPOT / 24 HRS)",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ada-adenosine-deaminase-049",
    "category": "Biochemistry",
    "name": "ADA - Adenosine Deaminase",
    "vial": "RED - PLAIN",
    "price": 900,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "alkaline-phosphatase-serum-050",
    "category": "Biochemistry",
    "name": "ALKALINE PHOSPHATASE, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "albumin-serum-051",
    "category": "Biochemistry",
    "name": "ALBUMIN, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "amylase-serum-052",
    "category": "Biochemistry",
    "name": "AMYLASE, SERUM",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "bilirubin-total-serum-053",
    "category": "Biochemistry",
    "name": "BILIRUBIN (TOTAL), SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "bilirubin-total-direct-indirect-serum-054",
    "category": "Biochemistry",
    "name": "BILIRUBIN (TOTAL, DIRECT & INDIRECT), SERUM",
    "vial": "RED - PLAIN",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "calcium-serum-055",
    "category": "Biochemistry",
    "name": "CALCIUM, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "cholesterol-total-serum-056",
    "category": "Biochemistry",
    "name": "CHOLESTEROL (TOTAL), SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "cpk-057",
    "category": "Biochemistry",
    "name": "CPK",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ck-mb-058",
    "category": "Biochemistry",
    "name": "CK MB",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "creatinine-serum-059",
    "category": "Biochemistry",
    "name": "CREATININE, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "gamma-gt-ggt-060",
    "category": "Biochemistry",
    "name": "GAMMA GT (GGT)",
    "vial": "RED - PLAIN",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "sugar-glucose-fasting-061",
    "category": "Biochemistry",
    "name": "SUGAR GLUCOSE FASTING",
    "vial": "GREY - Fluoride",
    "price": 50,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "sugar-glucose-pp-062",
    "category": "Biochemistry",
    "name": "SUGAR GLUCOSE PP",
    "vial": "GREY - Fluoride",
    "price": 50,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "sugar-glucose-random-063",
    "category": "Biochemistry",
    "name": "SUGAR GLUCOSE RANDOM",
    "vial": "GREY - Fluoride",
    "price": 50,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "egfr-glomerular-filtration-rate-064",
    "category": "Biochemistry",
    "name": "EGFR - GLOMERULAR FILTRATION RATE",
    "vial": "RED - PLAIN",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "hba1c-glycosylated-heamoglobin-065",
    "category": "Biochemistry",
    "name": "HBA1C (GLYCOSYLATED HEAMOGLOBIN)",
    "vial": "PURPLE",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ldh-066",
    "category": "Biochemistry",
    "name": "LDH",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "kft-1-kidney-function-test-creat-urea-calcium-uric-acid-067",
    "category": "Biochemistry",
    "name": "KFT-1 - KIDNEY FUNCTION TEST (creat, urea, calcium, uric acid)",
    "vial": "RED",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "kft-2-kidney-function-test-with-electrolyte-urine-r-e-068",
    "category": "Biochemistry",
    "name": "KFT-2 - KIDNEY FUNCTION TEST with Electrolyte & Urine R/E",
    "vial": "RED & Urine",
    "price": 900,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "liver-function-test-lft-069",
    "category": "Biochemistry",
    "name": "LIVER FUNCTION TEST (LFT)",
    "vial": "RED - PLAIN",
    "price": 599,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "lipid-profile-serum-070",
    "category": "Biochemistry",
    "name": "LIPID PROFILE,SERUM",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "lipase-serum-071",
    "category": "Biochemistry",
    "name": "LIPASE, SERUM",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "iron-serum-072",
    "category": "Biochemistry",
    "name": "IRON, SERUM",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "phosphorus-serum-073",
    "category": "Biochemistry",
    "name": "PHOSPHORUS,SERUM",
    "vial": "RED - PLAIN",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "total-protein-serum-074",
    "category": "Biochemistry",
    "name": "TOTAL PROTEIN, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "potassium-k-serum-075",
    "category": "Biochemistry",
    "name": "POTASSIUM (K+), SERUM",
    "vial": "RED - PLAIN",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "sodium-na-serum-076",
    "category": "Biochemistry",
    "name": "SODIUM (NA+), SERUM",
    "vial": "RED - PLAIN",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "electrolytes-serum-077",
    "category": "Biochemistry",
    "name": "ELECTROLYTES, SERUM",
    "vial": "RED - PLAIN",
    "price": 400,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "protein-albumin-globulin-a-g-ratio-078",
    "category": "Biochemistry",
    "name": "PROTEIN, ALBUMIN, GLOBULIN A-G RATIO",
    "vial": "RED - PLAIN",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "sgpt-serum-alt-079",
    "category": "Biochemistry",
    "name": "SGPT, SERUM - ALT",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "sgot-serum-ast-080",
    "category": "Biochemistry",
    "name": "SGOT, SERUM - AST",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "triglycerides-serum-081",
    "category": "Biochemistry",
    "name": "TRIGLYCERIDES, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "urea-082",
    "category": "Biochemistry",
    "name": "UREA",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "uric-acid-serum-083",
    "category": "Biochemistry",
    "name": "URIC ACID, SERUM",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "t3-084",
    "category": "Hormones & Tumor Marker",
    "name": "T3",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "t4-085",
    "category": "Hormones & Tumor Marker",
    "name": "T4",
    "vial": "RED - PLAIN",
    "price": 150,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "tsh-086",
    "category": "Hormones & Tumor Marker",
    "name": "TSH",
    "vial": "RED - PLAIN",
    "price": 300,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "t3-t4-tsh-thyroid-profile-087",
    "category": "Hormones & Tumor Marker",
    "name": "T3 T4 TSH (THYROID PROFILE)",
    "vial": "RED - PLAIN",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ft3-ft4-tsh-088",
    "category": "Hormones & Tumor Marker",
    "name": "FT3, FT4, TSH",
    "vial": "RED - PLAIN",
    "price": 600,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ft4-tsh-089",
    "category": "Hormones & Tumor Marker",
    "name": "FT4, TSH",
    "vial": "RED - PLAIN",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ft3-free-t3-090",
    "category": "Hormones & Tumor Marker",
    "name": "FT3 - FREE T3",
    "vial": "RED - PLAIN",
    "price": 250,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "ft4-free-t4-091",
    "category": "Hormones & Tumor Marker",
    "name": "FT4 - FREE T4",
    "vial": "RED - PLAIN",
    "price": 250,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 2
  },
  {
    "id": "beta-hcg-total-history-or-lmp-date-required-or-dr-s-prescription-092",
    "category": "Hormones & Tumor Marker",
    "name": "BETA HCG TOTAL - (History or LMP Date Required or Dr's Prescription)",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "lh-luteinising-hormone-093",
    "category": "Hormones & Tumor Marker",
    "name": "LH (LUTEINISING HORMONE)",
    "vial": "RED - PLAIN",
    "price": 450,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "fsh-follicular-stimulating-hormone-094",
    "category": "Hormones & Tumor Marker",
    "name": "FSH (FOLLICULAR STIMULATING HORMONE)",
    "vial": "RED - PLAIN",
    "price": 450,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "prl-prolactine-serum-history-required-095",
    "category": "Hormones & Tumor Marker",
    "name": "PRL (PROLACTINE), SERUM ( History Required)",
    "vial": "RED - PLAIN",
    "price": 500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "psa-total-prostate-specific-antigen-096",
    "category": "Hormones & Tumor Marker",
    "name": "PSA (TOTAL), PROSTATE SPECIFIC ANTIGEN",
    "vial": "RED - PLAIN",
    "price": 700,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "vitamin-d-25-hydroxy-097",
    "category": "Hormones & Tumor Marker",
    "name": "VITAMIN D (25 HYDROXY)",
    "vial": "RED & PURPLE",
    "price": 1000,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "vitamin-b12-098",
    "category": "Hormones & Tumor Marker",
    "name": "VITAMIN B12",
    "vial": "RED & PURPLE",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "total-ige-serum-099",
    "category": "Hormones & Tumor Marker",
    "name": "TOTAL IGE, SERUM",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "ferritin-serum-100",
    "category": "Hormones & Tumor Marker",
    "name": "FERRITIN, SERUM",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "pap-smear-101",
    "category": "Cytology",
    "name": "PAP SMEAR",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "lbc-liquid-based-cytology-102",
    "category": "Cytology",
    "name": "LBC-Liquid Based Cytology",
    "vial": "CONTAINER",
    "price": 1200,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "fluid-routine-examination-103",
    "category": "Cytology",
    "name": "FLUID ROUTINE EXAMINATION",
    "vial": "CONTAINER",
    "price": 800,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "fluid-cytology-104",
    "category": "Cytology",
    "name": "FLUID CYTOLOGY",
    "vial": "CONTAINER",
    "price": 800,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "fluid-analysis-with-ldh-afb-gram-ada-routine-and-cyto-105",
    "category": "Cytology",
    "name": "FLUID ANALYSIS (with LDH, AFB, GRAM, ADA, ROUTINE AND CYTO)",
    "vial": "CONTAINER",
    "price": 2800,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "bone-marrow-examination-106",
    "category": "Cytology",
    "name": "BONE MARROW EXAMINATION",
    "vial": "In Lab only",
    "price": 1500,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "fnac-fine-needle-aspiration-cytology-non-gynaec-cytology-107",
    "category": "Cytology",
    "name": "FNAC - FINE NEEDLE ASPIRATION CYTOLOGY, Non-Gynaec Cytology",
    "vial": "In Lab only",
    "price": 1200,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "second-opinion-108",
    "category": "Cytology",
    "name": "SECOND OPINION",
    "vial": "",
    "price": 500,
    "reportingTime": "",
    "sourcePage": 3
  },
  {
    "id": "culture-aerobic-susceptibility-pus-culture-109",
    "category": "Bacteriology",
    "name": "CULTURE AEROBIC & SUSCEPTIBILITY - PUS CULTURE",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "stool-culture-110",
    "category": "Bacteriology",
    "name": "STOOL CULTURE",
    "vial": "CONTAINER",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "pus-swab-culture-111",
    "category": "Bacteriology",
    "name": "PUS SWAB CULTURE",
    "vial": "PUS",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "throat-swab-culture-112",
    "category": "Bacteriology",
    "name": "THROAT SWAB CULTURE",
    "vial": "SWAB",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "conjunctival-swab-culture-113",
    "category": "Bacteriology",
    "name": "CONJUNCTIVAL SWAB CULTURE",
    "vial": "SWAB",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "skin-slit-smear-lepra-smear-114",
    "category": "Bacteriology",
    "name": "SKIN SLIT SMEAR - LEPRA SMEAR",
    "vial": "In Lab only",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "vaginal-swab-culsture-115",
    "category": "Bacteriology",
    "name": "VAGINAL SWAB CULSTURE",
    "vial": "SWAB",
    "price": 600,
    "reportingTime": "48 Hrs",
    "sourcePage": 3
  },
  {
    "id": "afb-stain-sputum-for-afb-116",
    "category": "Bacteriology",
    "name": "AFB STAIN - SPUTUM FOR AFB",
    "vial": "SPUTUM",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "afb-stain-sputum-for-afb-3-sample-117",
    "category": "Bacteriology",
    "name": "AFB STAIN - SPUTUM FOR AFB - 3 SAMPLE",
    "vial": "SPUTUM",
    "price": 600,
    "reportingTime": "3 days",
    "sourcePage": 3
  },
  {
    "id": "grams-stain-118",
    "category": "Bacteriology",
    "name": "GRAMS STAIN",
    "vial": "",
    "price": 200,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "blood-culture-119",
    "category": "Bacteriology",
    "name": "BLOOD CULTURE",
    "vial": "Sodium Heparin",
    "price": 1200,
    "reportingTime": "3 Days or 7 to 8 days",
    "sourcePage": 3
  },
  {
    "id": "care-plus-advance-health-checkup-cbc-lft-lipid-profile-kft-sugar-f-r-hba1c-t3-t4-tsh-120",
    "category": "Cytocare Profiles & Panels",
    "name": "CARE PLUS - Advance Health Checkup (CBC, LFT, LIPID PROFILE, KFT, SUGAR F/R, HBA1C, T3 T4 TSH)",
    "vial": "RED PURPLE GREY",
    "price": 1500,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "fitness-plus-whole-body-checkup-cbc-esr-glucose-f-r-hba1c-kft-creatinine-urea-electrolyte-calcium-uric-acid-lft-lipid-profile-thyroid-profile-vit-d-vit-b12-total-protein-albumin-hbsag-ra-crp-urine-r-e-121",
    "category": "Cytocare Profiles & Panels",
    "name": "Fitness Plus - Whole Body Checkup = (CBC, ESR, GLUCOSE F/R, HBA1C, KFT (CREATININE, UREA, ELECTROLYTE, CALCIUM, URIC ACID), LFT, LIPID PROFILE, THYROID PROFILE, VIT D, VIT B12, TOTAL PROTEIN, ALBUMIN HBSAG, RA, CRP, URINE R/E)",
    "vial": "RED BLACK PURPLE GREY, URINE",
    "price": 3000,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "diabetics-monitor-fasting-pp-hba1c-urine-r-e-urine-microalbumin-albumin-creatinine-ratio-egfr-lipid-profile-creatinine-bun-uric-acid-tsh-122",
    "category": "Cytocare Profiles & Panels",
    "name": "DIABETICS MONITOR = (FASTING,PP,HBA1C,URINE R/E, URINE MICROALBUMIN & ALBUMIN CREATININE RATIO, eGFR, LIPID PROFILE,CREATININE, BUN, URIC ACID, TSH)",
    "vial": "PURPLE GREY RED, URINE",
    "price": 1500,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "diabetics-monitor-plus-fasting-pp-hba1c-urine-r-e-urine-microalbumin-albumin-creatinine-ratio-egfr-lipid-profile-creatinine-bun-uric-acid-tsh-homa-ir-insulin-resistance-index-123",
    "category": "Cytocare Profiles & Panels",
    "name": "DIABETICS MONITOR PLUS = (FASTING,PP,HBA1C, URINE R/E, URINE MICROALBUMIN & ALBUMIN CREATININE RATIO, eGFR, LIPID PROFILE,CREATININE, BUN, URIC ACID, TSH, HOMA IR : INSULIN RESISTANCE INDEX)",
    "vial": "PURPLE GREY RED, URINE",
    "price": 3700,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "iron-profile-iron-ferritin-total-iron-binding-capacity-tibc-transferrin-saturation-hemoglobin-hb-124",
    "category": "Cytocare Profiles & Panels",
    "name": "IRON Profile = ( IRON, FERRITIN, Total Iron Binding Capacity (TIBC), Transferrin Saturation, Hemoglobin-HB )",
    "vial": "RED, PURPLE",
    "price": 1600,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 3
  },
  {
    "id": "fever-panel-cbc-esr-mp-widal-bilirubin-urine-r-e-125",
    "category": "Cytocare Profiles & Panels",
    "name": "FEVER PANEL = (CBC, ESR, MP, WIDAL, BILIRUBIN, URINE R/E)",
    "vial": "RED BLACK PURPLE, URINE",
    "price": 900,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 3
  },
  {
    "id": "anaemia-profile-1-cbc-peripheral-blood-smear-pbs-retic-count-hscrp-iron-profile-126",
    "category": "Cytocare Profiles & Panels",
    "name": "Anaemia Profile - 1 = ( CBC, Peripheral Blood Smear-PBS, Retic Count, hsCRP, IRON Profile )",
    "vial": "RED, PURPLE",
    "price": 1600,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "anaemia-profile-2-cbc-peripheral-blood-smear-pbs-retic-count-hscrp-iron-profile-hb-electrophoresis-variant-patient-blood-transfusion-history-and-prescription-xerox-required-127",
    "category": "Cytocare Profiles & Panels",
    "name": "Anaemia Profile - 2 = ( CBC, Peripheral Blood Smear-PBS, Retic Count, hsCRP, IRON Profile, HB Electrophoresis / Variant ) = ( Patient Blood Transfusion History and Prescription Xerox required )",
    "vial": "RED, PURPLE",
    "price": 4000,
    "reportingTime": "Next day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "arthrities-panel-1-cbc-esr-crp-uric-acid-aso-rf-calcium-128",
    "category": "Cytocare Profiles & Panels",
    "name": "ARTHRITIES PANEL - 1 (CBC, ESR, CRP, URIC ACID, ASO, RF, CALCIUM)",
    "vial": "RED BLACK PURPLE",
    "price": 1500,
    "reportingTime": "Same day ( 6pm to 7pm)",
    "sourcePage": 4
  },
  {
    "id": "arthrities-panel-2-cbc-esr-crp-uric-acid-aso-rf-calcium-ana-anti-ccp-129",
    "category": "Cytocare Profiles & Panels",
    "name": "ARTHRITIES PANEL - 2 (CBC, ESR, CRP, URIC ACID, ASO, RF, CALCIUM, ANA, ANTI CCP)",
    "vial": "RED BLACK PURPLE",
    "price": 2500,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "anc-profile-antenatal-profile-cbc-abo-sugar-vdrl-hiv-hbsag-hcv-tsh-urine-r-e-130",
    "category": "Cytocare Profiles & Panels",
    "name": "ANC PROFILE - ANTENATAL PROFILE = (CBC,ABO,SUGAR,VDRL,HIV,HBSAG,HCV,TSH,URINE R/E)",
    "vial": "PURPLE GREY RED, URINE",
    "price": 1300,
    "reportingTime": "Same day",
    "sourcePage": 4
  },
  {
    "id": "double-dual-marker-131",
    "category": "Specialised Test Menu",
    "name": "DOUBLE / DUAL MARKER",
    "vial": "RED - PLAIN",
    "price": 1800,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "pcod-panel-132",
    "category": "Specialised Test Menu",
    "name": "PCOD PANEL",
    "vial": "RED - PLAIN",
    "price": 3400,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "torch-10-panel-133",
    "category": "Specialised Test Menu",
    "name": "TORCH 10 PANEL",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "ca-125-cancer-marker-serum-134",
    "category": "Specialised Test Menu",
    "name": "CA 125, CANCER MARKER, SERUM",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "amh-anti-mullerian-hormone-serum-135",
    "category": "Specialised Test Menu",
    "name": "AMH (ANTI MULLERIAN HORMONE), SERUM",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "hb-electrophrosis-hplc-136",
    "category": "Specialised Test Menu",
    "name": "HB ELECTROPHROSIS / HPLC",
    "vial": "PURPLE - EDTA",
    "price": 1100,
    "reportingTime": "Next day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "homa-ir-1st-trimester-fasting-sample-137",
    "category": "Specialised Test Menu",
    "name": "HOMA IR (1st Trimester) - Fasting Sample",
    "vial": "RED - PLAIN, GRAY",
    "price": 1200,
    "reportingTime": "Same day ( 6pm to 7:30pm)",
    "sourcePage": 4
  },
  {
    "id": "small-biopsy-138",
    "category": "Specialised Test Menu",
    "name": "SMALL BIOPSY",
    "vial": "CONTAINER",
    "price": 1500,
    "reportingTime": "7 days",
    "sourcePage": 1
  },
  {
    "id": "medium-biopsy-139",
    "category": "Specialised Test Menu",
    "name": "MEDIUM BIOPSY",
    "vial": "CONTAINER",
    "price": 1600,
    "reportingTime": "7 days",
    "sourcePage": 1
  },
  {
    "id": "large-biopsy-140",
    "category": "Specialised Test Menu",
    "name": "LARGE BIOPSY",
    "vial": "CONTAINER",
    "price": 2500,
    "reportingTime": "10 to 15 days",
    "sourcePage": 1
  },
  {
    "id": "extra-large-biopsy-141",
    "category": "Specialised Test Menu",
    "name": "EXTRA LARGE BIOPSY",
    "vial": "CONTAINER",
    "price": 5500,
    "reportingTime": "10 to 15 days",
    "sourcePage": 1
  },
  {
    "id": "rubella-igg-142",
    "category": "Specialised Test Menu",
    "name": "RUBELLA IGG",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "rubella-igm-143",
    "category": "Specialised Test Menu",
    "name": "RUBELLA IGM",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "anti-tpo-ama-144",
    "category": "Specialised Test Menu",
    "name": "ANTI TPO - (AMA)",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "e2-estradial-145",
    "category": "Specialised Test Menu",
    "name": "E2 - ESTRADIAL",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "anti-ds-dna-146",
    "category": "Specialised Test Menu",
    "name": "ANTI DS DNA",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "allergy-panel-with-picture-147",
    "category": "Specialised Test Menu",
    "name": "ALLERGY PANEL - WITH PICTURE",
    "vial": "RED - PLAIN",
    "price": 6000,
    "reportingTime": "10 DAYS",
    "sourcePage": 1
  },
  {
    "id": "ace-angiotensin-converting-enzyme-148",
    "category": "Specialised Test Menu",
    "name": "ACE - ANGIOTENSIN CONVERTING ENZYME",
    "vial": "RED - PLAIN",
    "price": 1900,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "cysticercosis-antibody-igg-149",
    "category": "Specialised Test Menu",
    "name": "CYSTICERCOSIS ANTIBODY IGG",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "8 - 9 DAYS",
    "sourcePage": 1
  },
  {
    "id": "pth-intact-parathyroid-hormone-150",
    "category": "Specialised Test Menu",
    "name": "PTH - INTACT PARATHYROID HORMONE",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "alpha-feto-protein-afp-151",
    "category": "Specialised Test Menu",
    "name": "ALPHA FETO PROTEIN (AFP)",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "afb-tb-mycobacterium-tuberculosis-dna-pcr-152",
    "category": "Specialised Test Menu",
    "name": "AFB/TB - MYCOBACTERIUM TUBERCULOSIS DNA PCR",
    "vial": "SPUTUM / PUS",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "afb-tb-culture-fluorescent-method-rapid-mgit-153",
    "category": "Specialised Test Menu",
    "name": "AFB/TB CULTURE - FLUORESCENT METHOD (RAPID - MGIT)",
    "vial": "SPUTUM / PUS",
    "price": 4000,
    "reportingTime": "1 & 1/2 months",
    "sourcePage": 1
  },
  {
    "id": "boh-panel-1-154",
    "category": "Specialised Test Menu",
    "name": "BOH PANEL - 1",
    "vial": "RED, SKY",
    "price": 10000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "boh-panel-2-155",
    "category": "Specialised Test Menu",
    "name": "BOH PANEL - 2",
    "vial": "RED, SKY, GREEN SODIUM CITRATE",
    "price": 14500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "cea-carcino-embryonic-antigen-156",
    "category": "Specialised Test Menu",
    "name": "CEA (CARCINO EMBRYONIC ANTIGEN)",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "copper-157",
    "category": "Specialised Test Menu",
    "name": "COPPER",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "zinc-158",
    "category": "Specialised Test Menu",
    "name": "ZINC",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "homocysteine-159",
    "category": "Specialised Test Menu",
    "name": "HOMOCYSTEINE",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "estradiol-e2-160",
    "category": "Specialised Test Menu",
    "name": "ESTRADIOL (E2)",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 1
  },
  {
    "id": "progesterone-161",
    "category": "Specialised Test Menu",
    "name": "PROGESTERONE",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 1
  },
  {
    "id": "ebv-vca-igg-igm-162",
    "category": "Specialised Test Menu",
    "name": "EBV (VCA) - IGG, IGM",
    "vial": "RED - PLAIN",
    "price": 5000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "scrub-typhus-igm-163",
    "category": "Specialised Test Menu",
    "name": "SCRUB TYPHUS IGM",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 1
  },
  {
    "id": "triple-marker-164",
    "category": "Specialised Test Menu",
    "name": "TRIPLE MARKER",
    "vial": "RED - PLAIN",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "quadruple-markers-165",
    "category": "Specialised Test Menu",
    "name": "QUADRUPLE MARKERS",
    "vial": "RED - PLAIN",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "ana-profile-ifa-hep-2-with-reflex-titer-166",
    "category": "Specialised Test Menu",
    "name": "ANA PROFILE IFA HEP-2 WITH REFLEX TITER",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "ana-profile-ifa-hep-2-without-reflex-titer-167",
    "category": "Specialised Test Menu",
    "name": "ANA PROFILE IFA HEP-2 WITHOUT REFLEX TITER",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "ena-extractable-nuclear-antigens-168",
    "category": "Specialised Test Menu",
    "name": "ENA (EXTRACTABLE NUCLEAR ANTIGENS)",
    "vial": "RED - PLAIN",
    "price": 5500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "apl-anti-phospholipid-antibody-igg-igm-169",
    "category": "Specialised Test Menu",
    "name": "APL - ANTI PHOSPHOLIPID ANTIBODY - IGG, IGM",
    "vial": "RED - PLAIN",
    "price": 3000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "acl-anti-cardiolipin-antibody-igg-igm-iga-170",
    "category": "Specialised Test Menu",
    "name": "ACL - ANTI CARDIOLIPIN ANTIBODY - IGG, IGM, IGA",
    "vial": "RED - PLAIN",
    "price": 3000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "lupus-anticoagulant-171",
    "category": "Specialised Test Menu",
    "name": "LUPUS ANTICOAGULANT",
    "vial": "SKY - SODIUM CITRATE",
    "price": 3000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "tg-anti-thyroglobulin-172",
    "category": "Specialised Test Menu",
    "name": "TG (ANTI THYROGLOBULIN)",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "apolipoprotein-a1-173",
    "category": "Specialised Test Menu",
    "name": "APOLIPOPROTEIN A1",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "apolipoprotein-b-174",
    "category": "Specialised Test Menu",
    "name": "APOLIPOPROTEIN B",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "acth-adreno-corticotrophic-hormone-175",
    "category": "Specialised Test Menu",
    "name": "ACTH - ADRENO CORTICOTROPHIC HORMONE",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "aspergillus-fumigatus-specific-ige-176",
    "category": "Specialised Test Menu",
    "name": "ASPERGILLUS FUMIGATUS SPECIFIC - IGE",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "beta-2-glycoprotein-1-panel-igg-iga-igm-177",
    "category": "Specialised Test Menu",
    "name": "BETA 2 GLYCOPROTEIN 1 (PANEL IGG, IGA, IGM)",
    "vial": "RED - PLAIN",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "beta-2-microglobulin-178",
    "category": "Specialised Test Menu",
    "name": "BETA 2 MICROGLOBULIN",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "bile-acids-total-179",
    "category": "Specialised Test Menu",
    "name": "BILE ACIDS - TOTAL",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "ca-19-9-cancer-marker-180",
    "category": "Specialised Test Menu",
    "name": "CA 19.9 - CANCER MARKER",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "ca-15-3-cancer-marker-181",
    "category": "Specialised Test Menu",
    "name": "CA 15.3 - CANCER MARKER",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 1
  },
  {
    "id": "calcitonin-182",
    "category": "Specialised Test Menu",
    "name": "CALCITONIN",
    "vial": "RED - PLAIN",
    "price": 2900,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "calprotectin-fecal-183",
    "category": "Specialised Test Menu",
    "name": "CALPROTECTIN - FECAL",
    "vial": "STOOL",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "ceruloplasmin-184",
    "category": "Specialised Test Menu",
    "name": "CERULOPLASMIN",
    "vial": "RED - PLAIN",
    "price": 1800,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "cortisol-185",
    "category": "Specialised Test Menu",
    "name": "CORTISOL",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 2
  },
  {
    "id": "c-peptide-186",
    "category": "Specialised Test Menu",
    "name": "C-PEPTIDE",
    "vial": "RED - PLAIN",
    "price": 1200,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "cystatin-c-187",
    "category": "Specialised Test Menu",
    "name": "CYSTATIN C",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "dhea-dehydroepiandrosterone-188",
    "category": "Specialised Test Menu",
    "name": "DHEA - DEHYDROEPIANDROSTERONE",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 2
  },
  {
    "id": "folic-acid-folate-189",
    "category": "Specialised Test Menu",
    "name": "FOLIC ACID - FOLATE",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 2
  },
  {
    "id": "g6pd-190",
    "category": "Specialised Test Menu",
    "name": "G6PD",
    "vial": "PURPLE - EDTA",
    "price": 1200,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "gad-65-191",
    "category": "Specialised Test Menu",
    "name": "GAD - 65",
    "vial": "RED - PLAIN",
    "price": 7500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "gene-xpert-xpert-mtb-rif-extrapulmonary-192",
    "category": "Specialised Test Menu",
    "name": "GENE XPERT (XPERT/MTB/RIF-EXTRAPULMONARY)",
    "vial": "SPUTUM / PUS",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "gene-xpert-xpert-mtb-rif-pulmonary-193",
    "category": "Specialised Test Menu",
    "name": "GENE XPERT (XPERT/MTB/RIF-PULMONARY)",
    "vial": "SPUTUM",
    "price": 4000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "growth-hormone-gh-194",
    "category": "Specialised Test Menu",
    "name": "GROWTH HORMONE (GH)",
    "vial": "RED - PLAIN",
    "price": 1200,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hepatitis-a-virus-hav-antibody-igg-195",
    "category": "Specialised Test Menu",
    "name": "HEPATITIS A VIRUS (HAV)-ANTIBODY - IGG",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hepatitis-a-virus-hav-antibody-igm-196",
    "category": "Specialised Test Menu",
    "name": "HEPATITIS A VIRUS (HAV)-ANTIBODY - IGM",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hepatitis-b-viral-load-quantitative-pcr-197",
    "category": "Specialised Test Menu",
    "name": "HEPATITIS B VIRAL LOAD - QUANTITATIVE - PCR",
    "vial": "PURPLE - EDTA",
    "price": 9500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hepatitis-c-virus-rna-quantitative-viral-load-pcr-198",
    "category": "Specialised Test Menu",
    "name": "HEPATITIS C VIRUS RNA QUANTITATIVE (VIRAL LOAD) - PCR",
    "vial": "PURPLE - EDTA",
    "price": 9500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hsv-herpes-simplex-virus-1-2-igm-igg-199",
    "category": "Specialised Test Menu",
    "name": "HSV - HERPES SIMPLEX VIRUS 1+2 IGM IGG",
    "vial": "PURPLE - EDTA",
    "price": 3000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hiv-1-rna-qualitative-pcr-200",
    "category": "Specialised Test Menu",
    "name": "HIV-1 RNA QUALITATIVE - PCR",
    "vial": "PURPLE - EDTA",
    "price": 4500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hiv-1-rna-quantitative-pcr-201",
    "category": "Specialised Test Menu",
    "name": "HIV-1 RNA QUANTITATIVE - PCR",
    "vial": "PURPLE - EDTA",
    "price": 6500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "hla-b-27-flowcytometry-202",
    "category": "Specialised Test Menu",
    "name": "HLA B-27 - FLOWCYTOMETRY",
    "vial": "PURPLE - EDTA",
    "price": 2500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "ihc-breast-hormone-receptor-er-pr-her2-ki67-203",
    "category": "Specialised Test Menu",
    "name": "IHC - BREAST HORMONE RECEPTOR (ER, PR, HER2, KI67)",
    "vial": "HISTOPATHOLOGY",
    "price": 9000,
    "reportingTime": "5 - 6 DAYS",
    "sourcePage": 2
  },
  {
    "id": "immunoglobulin-g-igg-204",
    "category": "Specialised Test Menu",
    "name": "IMMUNOGLOBULIN G, IGG",
    "vial": "RED - PLAIN",
    "price": 1000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "immunoglobulin-capsule-i-igg-iga-igm-205",
    "category": "Specialised Test Menu",
    "name": "IMMUNOGLOBULIN CAPSULE I (IGG, IGA, IGM)",
    "vial": "RED - PLAIN",
    "price": 2500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "insulin-f-206",
    "category": "Specialised Test Menu",
    "name": "INSULIN - F",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "Same day ( 6pm to 7.30pm)",
    "sourcePage": 2
  },
  {
    "id": "karyotyping-single-individual-207",
    "category": "Specialised Test Menu",
    "name": "KARYOTYPING - SINGLE INDIVIDUAL",
    "vial": "SOD HEPARIN-GREEN",
    "price": 5000,
    "reportingTime": "15 - 20 Days",
    "sourcePage": 2
  },
  {
    "id": "lithium-208",
    "category": "Specialised Test Menu",
    "name": "LITHIUM",
    "vial": "RED - PLAIN",
    "price": 800,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "mtb-xpert-xdr-209",
    "category": "Specialised Test Menu",
    "name": "MTB-XPERT XDR",
    "vial": "SPUTUM / PUS",
    "price": 5000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "nt-probnp-210",
    "category": "Specialised Test Menu",
    "name": "NT-PROBNP",
    "vial": "RED - PLAIN",
    "price": 4500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "osmolality-serum-211",
    "category": "Specialised Test Menu",
    "name": "OSMOLALITY - SERUM",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "c-anca-212",
    "category": "Specialised Test Menu",
    "name": "C-ANCA",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "p-anca-213",
    "category": "Specialised Test Menu",
    "name": "P-ANCA",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "phenytoin-eptoin-214",
    "category": "Specialised Test Menu",
    "name": "PHENYTOIN (EPTOIN)",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "procalcitonin-pct-215",
    "category": "Specialised Test Menu",
    "name": "PROCALCITONIN, PCT",
    "vial": "RED - PLAIN",
    "price": 4500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "protein-electrophoresis-216",
    "category": "Specialised Test Menu",
    "name": "PROTEIN ELECTROPHORESIS",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "sex-hormone-binding-globulin-shbg-217",
    "category": "Specialised Test Menu",
    "name": "SEX HORMONE BINDING - GLOBULIN (SHBG)",
    "vial": "RED - PLAIN",
    "price": 3000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "ss-a-ro-igg-218",
    "category": "Specialised Test Menu",
    "name": "SS-A (RO) IGG",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "ss-b-la-igg-219",
    "category": "Specialised Test Menu",
    "name": "SS-B (LA) IGG",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "stone-analysis-kidney-by-ftir-220",
    "category": "Specialised Test Menu",
    "name": "STONE ANALYSIS - KIDNEY - (BY FTIR)",
    "vial": "STONE CONTAINER",
    "price": 2000,
    "reportingTime": "7 - 8 DAYS",
    "sourcePage": 2
  },
  {
    "id": "streptococcus-group-b-antigen-221",
    "category": "Specialised Test Menu",
    "name": "STREPTOCOCCUS GROUP B - ANTIGEN",
    "vial": "RED - PLAIN",
    "price": 2000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "tacrolimus-222",
    "category": "Specialised Test Menu",
    "name": "TACROLIMUS",
    "vial": "PURPLE - EDTA",
    "price": 5500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "tpha-treponema-pallidum-haemagglutination-assay-223",
    "category": "Specialised Test Menu",
    "name": "TPHA - TREPONEMA PALLIDUM HAEMAGGLUTINATION ASSAY",
    "vial": "RED - PLAIN",
    "price": 1500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "vasculitis-panel-224",
    "category": "Specialised Test Menu",
    "name": "VASCULITIS PANEL",
    "vial": "RED - PLAIN",
    "price": 6500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 2
  },
  {
    "id": "vitamin-b2-225",
    "category": "Specialised Test Menu",
    "name": "VITAMIN B2",
    "vial": "PURPLE - EDTA",
    "price": 5000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 3
  },
  {
    "id": "vitamin-b6-226",
    "category": "Specialised Test Menu",
    "name": "VITAMIN B6",
    "vial": "PURPLE - EDTA",
    "price": 5000,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 3
  },
  {
    "id": "vitamin-c-227",
    "category": "Specialised Test Menu",
    "name": "VITAMIN C",
    "vial": "RED - PLAIN",
    "price": 6500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 3
  },
  {
    "id": "vitamin-e-228",
    "category": "Specialised Test Menu",
    "name": "VITAMIN E",
    "vial": "PURPLE & RED",
    "price": 6500,
    "reportingTime": "4 - 5 DAYS",
    "sourcePage": 3
  },
  {
    "id": "lbc-hpv-dna-pcr-229",
    "category": "Specialised Test Menu",
    "name": "LBC + HPV DNA PCR",
    "vial": "CONTAINER + BRUSH",
    "price": 1900,
    "reportingTime": "5 to 6 Days (6pm to 7.30pm)",
    "sourcePage": 3
  },
  {
    "id": "nipt-230",
    "category": "Specialised Test Menu",
    "name": "NIPT",
    "vial": "TUBE & FORM",
    "price": 9000,
    "reportingTime": "8 to 10 Days (6pm to 7.30pm)",
    "sourcePage": 3
  }
];

export const cytocareCategories = Array.from(
  new Set(cytocareTests.map((test) => test.category))
);
