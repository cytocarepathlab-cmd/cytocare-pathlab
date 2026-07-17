"use client";

import type { ReactNode } from "react";
import {
  FaBaby,
  FaBone,
  FaBriefcaseMedical,
  FaCapsules,
  FaChild,
  FaFemale,
  FaFlask,
  FaHeartbeat,
  FaRibbon,
  FaRunning,
  FaSyringe,
  FaThermometerHalf,
  FaTint,
  FaUserMd,
  FaUsers,
  FaVenusMars,
  FaVial,
} from "react-icons/fa";

export type HealthCategory = {
  name: string;
  icon: ReactNode;
  bg: string;
  text: string;
  badge?: string;
};

export type HealthPackage = {
  title: string;
  packageName: string;
  price: number;
  originalPrice?: number;
  description: string;
  badge?: string;
  tests: string[];
  details?: string[];
};

export const healthCategories: HealthCategory[] = [
  {
    name: "Full Body",
    icon: <FaUserMd />,
    bg: "bg-[#eafbff]",
    text: "text-[#0754dc]",
  },
  {
    name: "Heart",
    icon: <FaHeartbeat />,
    bg: "bg-[#e8fff0]",
    text: "text-[#e71935]",
    badge: "Most Booked",
  },
  {
    name: "Fever",
    icon: <FaThermometerHalf />,
    bg: "bg-[#fff8df]",
    text: "text-[#e71935]",
  },
  {
    name: "Vitamin",
    icon: <FaCapsules />,
    bg: "bg-[#fff0f2]",
    text: "text-[#0754dc]",
  },
  {
    name: "Diabetes",
    icon: <FaBriefcaseMedical />,
    bg: "bg-[#eafbff]",
    text: "text-[#05a832]",
  },
  {
    name: "Thyroid",
    icon: <FaFlask />,
    bg: "bg-[#eafbff]",
    text: "text-[#0754dc]",
  },
  {
    name: "Hormones",
    icon: <FaVial />,
    bg: "bg-[#eafbff]",
    text: "text-[#e71935]",
  },
  {
    name: "Lifestyle",
    icon: <FaRunning />,
    bg: "bg-[#e8fff0]",
    text: "text-[#0754dc]",
  },
  {
    name: "Cancer",
    icon: <FaRibbon />,
    bg: "bg-[#e8fff0]",
    text: "text-[#e71935]",
  },
  {
    name: "Combo",
    icon: <FaUsers />,
    bg: "bg-[#fff8df]",
    text: "text-[#0754dc]",
  },
  {
    name: "Pregnancy",
    icon: <FaBaby />,
    bg: "bg-[#fff0f2]",
    text: "text-[#e71935]",
  },
  {
    name: "Allergy",
    icon: <FaSyringe />,
    bg: "bg-[#fff0f2]",
    text: "text-[#0754dc]",
  },
  {
    name: "Arthritis",
    icon: <FaBone />,
    bg: "bg-[#eafbff]",
    text: "text-[#e71935]",
  },
  {
    name: "STD",
    icon: <FaVenusMars />,
    bg: "bg-[#e8fff0]",
    text: "text-[#0754dc]",
  },
  {
    name: "Anemia",
    icon: <FaTint />,
    bg: "bg-[#fff0f2]",
    text: "text-[#e71935]",
  },
  {
    name: "Antenatal",
    icon: <FaChild />,
    bg: "bg-[#eafbff]",
    text: "text-[#0754dc]",
  },
];

export const healthPackagesByCategory: Record<string, HealthPackage[]> = {
  "Full Body": [
    {
      title: "Care Plus - Advance Health Checkup",
      packageName:
        "CARE PLUS - Advance Health Checkup (CBC, LFT, LIPID PROFILE, KFT, SUGAR F/R, HBA1C, T3 T4 TSH)",
      price: 1500,
      originalPrice: 2200,
      description:
        "Complete basic health package for blood, liver, kidney, lipid, sugar and thyroid screening.",
      badge: "Popular",
      tests: ["CBC", "LFT", "Lipid Profile", "KFT", "Sugar F/R", "HbA1c", "T3 T4 TSH"],
    },
    {
      title: "Fitness Plus - Whole Body Checkup",
      packageName:
        "Fitness Plus - Whole Body Checkup = (CBC, ESR, GLUCOSE F/R, HBA1C, KFT (CREATININE, UREA, ELECTROLYTE, CALCIUM, URIC ACID), LFT, LIPID PROFILE, THYROID PROFILE, VIT D, VIT B12, TOTAL PROTEIN, ALBUMIN HBSAG, RA, CRP, URINE R/E)",
      price: 3000,
      originalPrice: 4500,
      description:
        "Advanced whole body package with vitamins, diabetes, thyroid, liver, kidney, lipid, urine and inflammation screening.",
      badge: "Comprehensive",
      tests: [
        "CBC",
        "ESR",
        "Glucose F/R",
        "HbA1c",
        "KFT",
        "LFT",
        "Lipid Profile",
        "Thyroid Profile",
        "Vitamin D",
        "Vitamin B12",
        "Urine R/E",
      ],
    },
    {
      title: "BMP - Basic Metabolic Panel",
      packageName: "BMP - Basic Metabolic Panel",
      price: 599,
      originalPrice: 999,
      description:
        "Affordable basic screening for blood, sugar, liver, kidney, urine and cholesterol.",
      badge: "Affordable",
      tests: ["CBC", "Bilirubin", "ALT", "Cholesterol", "Creatinine", "Urine Routine", "FBS / RBS"],
    },
  ],

  Heart: [
    {
      title: "Lipid Profile",
      packageName: "LIPID PROFILE,SERUM",
      price: 600,
      originalPrice: 900,
      description: "Heart-risk screening for cholesterol and lipid levels.",
      badge: "Heart Health",
      tests: ["Total Cholesterol", "Triglycerides", "HDL", "LDL", "VLDL"],
    },
    {
      title: "Cholesterol Total",
      packageName: "CHOLESTEROL (TOTAL), SERUM",
      price: 150,
      originalPrice: 250,
      description: "Basic cholesterol screening test.",
      tests: ["Total Cholesterol"],
    },
    {
      title: "Triglycerides",
      packageName: "TRIGLYCERIDES, SERUM",
      price: 150,
      originalPrice: 250,
      description: "Useful for lipid and heart-risk evaluation.",
      tests: ["Triglycerides"],
    },
    {
      title: "CK MB",
      packageName: "CK MB",
      price: 800,
      originalPrice: 1200,
      description: "Cardiac enzyme test often used in heart-related evaluation.",
      tests: ["CK MB"],
    },
  ],

  Fever: [
    {
      title: "Fever Panel",
      packageName: "FEVER PANEL = (CBC, ESR, MP, WIDAL, BILIRUBIN, URINE R/E)",
      price: 900,
      originalPrice: 1400,
      description: "Fever screening panel for common infection markers.",
      badge: "Fever Package",
      tests: ["CBC", "ESR", "MP", "Widal", "Bilirubin", "Urine R/E"],
    },
    {
      title: "Dengue Card Test",
      packageName: "DENGUE CARD TEST (NS1 + IGG + IGM)",
      price: 800,
      originalPrice: 1200,
      description: "Rapid screening for dengue NS1, IgG and IgM.",
      tests: ["NS1", "IgG", "IgM"],
    },
    {
      title: "Widal Test",
      packageName: "WIDAL TEST",
      price: 200,
      originalPrice: 350,
      description: "Common test used in typhoid fever evaluation.",
      tests: ["Widal"],
    },
    {
      title: "Typhi Dot IgG IgM",
      packageName: "TYPHI DOT IGG IGM",
      price: 500,
      originalPrice: 750,
      description: "Typhoid screening through IgG and IgM.",
      tests: ["Typhi Dot IgG", "Typhi Dot IgM"],
    },
  ],

  Vitamin: [
    {
      title: "Vitamin D",
      packageName: "VITAMIN D (25 HYDROXY)",
      price: 1000,
      originalPrice: 1500,
      description: "Vitamin D deficiency screening.",
      badge: "Common",
      tests: ["Vitamin D 25 Hydroxy"],
    },
    {
      title: "Vitamin B12",
      packageName: "VITAMIN B12",
      price: 800,
      originalPrice: 1200,
      description: "Vitamin B12 deficiency screening.",
      tests: ["Vitamin B12"],
    },
    {
      title: "Vitamin D + B12 Combo",
      packageName: "VITAMIN D VIT B12",
      price: 1800,
      originalPrice: 2300,
      description: "Combined vitamin deficiency screening.",
      tests: ["Vitamin D", "Vitamin B12"],
    },
  ],

  Diabetes: [
    {
      title: "Diabetics Monitor",
      packageName:
        "DIABETICS MONITOR = (FASTING,PP,HBA1C,URINE R/E, URINE MICROALBUMIN & ALBUMIN CREATININE RATIO, eGFR, LIPID PROFILE,CREATININE, BUN, URIC ACID, TSH)",
      price: 1500,
      originalPrice: 2400,
      description: "Diabetes monitoring package with sugar, kidney, urine, lipid and thyroid checks.",
      badge: "Diabetes Care",
      tests: ["Fasting", "PP", "HbA1c", "Urine R/E", "Microalbumin", "eGFR", "Lipid Profile", "Creatinine", "Uric Acid", "TSH"],
    },
    {
      title: "Diabetics Monitor Plus",
      packageName:
        "DIABETICS MONITOR PLUS = (FASTING,PP,HBA1C, URINE R/E, URINE MICROALBUMIN & ALBUMIN CREATININE RATIO, eGFR, LIPID PROFILE,CREATININE, BUN, URIC ACID, TSH, HOMA IR : INSULIN RESISTANCE INDEX)",
      price: 3700,
      originalPrice: 5000,
      description: "Advanced diabetes package with HOMA IR insulin resistance index.",
      badge: "Advanced",
      tests: ["Fasting", "PP", "HbA1c", "Urine R/E", "Microalbumin", "eGFR", "Lipid Profile", "Creatinine", "TSH", "HOMA IR"],
    },
    {
      title: "HbA1c",
      packageName: "HBA1C (GLYCOSYLATED HEAMOGLOBIN)",
      price: 500,
      originalPrice: 800,
      description: "Average blood sugar monitoring test.",
      tests: ["HbA1c"],
    },
    {
      title: "Sugar Fasting",
      packageName: "SUGAR GLUCOSE FASTING",
      price: 50,
      originalPrice: 100,
      description: "Basic fasting sugar test.",
      tests: ["Fasting Sugar"],
    },
  ],

  Thyroid: [
    {
      title: "Thyroid Profile",
      packageName: "T3 T4 TSH (THYROID PROFILE)",
      price: 500,
      originalPrice: 800,
      description: "Complete basic thyroid profile.",
      badge: "Popular",
      tests: ["T3", "T4", "TSH"],
    },
    {
      title: "FT3 FT4 TSH",
      packageName: "FT3, FT4, TSH",
      price: 600,
      originalPrice: 900,
      description: "Free thyroid hormone profile with TSH.",
      tests: ["FT3", "FT4", "TSH"],
    },
    {
      title: "FT4 TSH",
      packageName: "FT4, TSH",
      price: 500,
      originalPrice: 750,
      description: "Useful for thyroid monitoring.",
      tests: ["FT4", "TSH"],
    },
    {
      title: "TSH",
      packageName: "TSH",
      price: 300,
      originalPrice: 500,
      description: "Basic thyroid screening test.",
      tests: ["TSH"],
    },
  ],

  Hormones: [
    {
      title: "LH",
      packageName: "LH (LUTEINISING HORMONE)",
      price: 450,
      originalPrice: 700,
      description: "Hormone test used in fertility and reproductive health evaluation.",
      tests: ["LH"],
    },
    {
      title: "FSH",
      packageName: "FSH (FOLLICULAR STIMULATING HORMONE)",
      price: 450,
      originalPrice: 700,
      description: "Hormone test used in fertility and reproductive health evaluation.",
      tests: ["FSH"],
    },
    {
      title: "Prolactin",
      packageName: "PRL (PROLACTINE), SERUM (History Required)",
      price: 500,
      originalPrice: 800,
      description: "Prolactin hormone test.",
      tests: ["PRL / Prolactin"],
    },
    {
      title: "Beta HCG Total",
      packageName: "BETA HCG TOTAL - (History or LMP Date Required or Dr's Prescription)",
      price: 800,
      originalPrice: 1200,
      description: "Pregnancy-related hormone test.",
      tests: ["Beta HCG Total"],
    },
    {
      title: "AMH",
      packageName: "AMH (ANTI MULLERIAN HORMONE), SERUM",
      price: 2000,
      originalPrice: 2800,
      description: "Anti-Mullerian Hormone test used in ovarian reserve evaluation.",
      tests: ["AMH"],
    },
    {
      title: "PCOD Panel",
      packageName: "PCOD PANEL",
      price: 3400,
      originalPrice: 4500,
      description: "Hormonal panel for PCOD-related evaluation.",
      badge: "Women Health",
      tests: ["PCOD Panel"],
    },
  ],

  Lifestyle: [
    {
      title: "Care Plus Lifestyle Checkup",
      packageName:
        "CARE PLUS - Advance Health Checkup (CBC, LFT, LIPID PROFILE, KFT, SUGAR F/R, HBA1C, T3 T4 TSH)",
      price: 1500,
      originalPrice: 2200,
      description: "Best for busy lifestyle, stress, irregular diet and annual health screening.",
      badge: "Lifestyle",
      tests: ["CBC", "LFT", "Lipid Profile", "KFT", "Sugar F/R", "HbA1c", "T3 T4 TSH"],
    },
    {
      title: "Fitness Plus Lifestyle Checkup",
      packageName:
        "Fitness Plus - Whole Body Checkup = (CBC, ESR, GLUCOSE F/R, HBA1C, KFT (CREATININE, UREA, ELECTROLYTE, CALCIUM, URIC ACID), LFT, LIPID PROFILE, THYROID PROFILE, VIT D, VIT B12, TOTAL PROTEIN, ALBUMIN HBSAG, RA, CRP, URINE R/E)",
      price: 3000,
      originalPrice: 4500,
      description: "Advanced lifestyle screening with vitamins, thyroid, liver, kidney, lipid and urine tests.",
      tests: ["CBC", "ESR", "HbA1c", "KFT", "LFT", "Lipid Profile", "Thyroid", "Vitamin D", "Vitamin B12", "Urine R/E"],
    },
    {
      title: "Liver Function Test",
      packageName: "LIVER FUNCTION TEST (LFT)",
      price: 600,
      originalPrice: 900,
      description: "Liver health screening.",
      tests: ["LFT"],
    },
    {
      title: "Kidney Function Test",
      packageName: "KFT-2 - KIDNEY FUNCTION TEST with Electrolyte & Urine R/E",
      price: 900,
      originalPrice: 1300,
      description: "Kidney health screening with electrolyte and urine routine.",
      tests: ["Creatinine", "Urea", "Electrolytes", "Urine R/E"],
    },
  ],

  Cancer: [
    {
      title: "CA-125 Cancer Marker",
      packageName: "CA 125, CANCER MARKER, SERUM",
      price: 1000,
      originalPrice: 1500,
      description: "Cancer marker test commonly used in women health screening.",
      badge: "Cancer Marker",
      tests: ["CA-125"],
    },
    {
      title: "PSA Total",
      packageName: "PSA (TOTAL), PROSTATE SPECIFIC ANTIGEN",
      price: 700,
      originalPrice: 1000,
      description: "Prostate health marker test for men.",
      tests: ["PSA Total"],
    },
    {
      title: "PAP Smear",
      packageName: "PAP SMEAR",
      price: 600,
      originalPrice: 900,
      description: "Cervical screening test.",
      tests: ["PAP Smear"],
    },
    {
      title: "LBC - Liquid Based Cytology",
      packageName: "LBC-Liquid Based Cytology",
      price: 1200,
      originalPrice: 1800,
      description: "Advanced cervical cytology screening.",
      tests: ["LBC"],
    },
  ],

  Combo: [
    {
      title: "BMP - Basic Metabolic Panel",
      packageName: "BMP - Basic Metabolic Panel",
      price: 599,
      originalPrice: 999,
      description: "Low-cost basic health combo package.",
      badge: "Budget Combo",
      tests: ["CBC", "Bilirubin", "ALT", "Cholesterol", "Creatinine", "Urine Routine", "FBS / RBS"],
    },
    {
      title: "Fever Panel Combo",
      packageName: "FEVER PANEL = (CBC, ESR, MP, WIDAL, BILIRUBIN, URINE R/E)",
      price: 900,
      originalPrice: 1400,
      description: "Combo for fever and infection screening.",
      tests: ["CBC", "ESR", "MP", "Widal", "Bilirubin", "Urine R/E"],
    },
    {
      title: "Iron Profile Combo",
      packageName:
        "IRON Profile = (IRON, FERRITIN, Total Iron Binding Capacity (TIBC), Transferrin Saturation, Hemoglobin-HB )",
      price: 1600,
      originalPrice: 2200,
      description: "Iron deficiency evaluation combo.",
      tests: ["Iron", "Ferritin", "TIBC", "Transferrin Saturation", "Hemoglobin"],
    },
  ],

  Pregnancy: [
    {
      title: "Beta HCG Total",
      packageName: "BETA HCG TOTAL - (History or LMP Date Required or Dr's Prescription)",
      price: 800,
      originalPrice: 1200,
      description: "Pregnancy-related hormone test.",
      badge: "Pregnancy",
      tests: ["Beta HCG Total"],
    },
    {
      title: "Urine Pregnancy Test",
      packageName: "URINE PREGNANCY TEST",
      price: 150,
      originalPrice: 300,
      description: "Basic urine pregnancy screening.",
      tests: ["Urine Pregnancy Test"],
    },
    {
      title: "Double / Dual Marker",
      packageName: "DOUBLE / DUAL MARKER",
      price: 1800,
      originalPrice: 2500,
      description: "Pregnancy screening marker test.",
      tests: ["Double / Dual Marker"],
    },
    {
      title: "TORCH 10 Panel",
      packageName: "TORCH 10 PANEL",
      price: 2500,
      originalPrice: 3500,
      description: "Pregnancy infection screening panel.",
      tests: ["TORCH 10 Panel"],
    },
  ],

  Allergy: [
    {
      title: "Total IgE",
      packageName: "TOTAL IGE, SERUM",
      price: 800,
      originalPrice: 1200,
      description: "Allergy-related IgE screening test.",
      badge: "Allergy",
      tests: ["Total IgE"],
    },
    {
      title: "Eosinophil / CBC Screening",
      packageName: "CBC - COMPLETE BLOOD COUNTS",
      price: 300,
      originalPrice: 500,
      description: "Basic blood screening helpful in allergy evaluation.",
      tests: ["CBC"],
    },
    {
      title: "CRP",
      packageName: "CRP (C-REACTIVE PROTEIN) - QUANTITATIVE",
      price: 400,
      originalPrice: 650,
      description: "Inflammation marker test.",
      tests: ["CRP"],
    },
  ],

  Arthritis: [
    {
      title: "Arthritis Panel 1",
      packageName: "ARTHRITIES PANEL - 1 (CBC, ESR, CRP, URIC ACID, ASO, RF, CALCIUM)",
      price: 1500,
      originalPrice: 2300,
      description: "Basic arthritis and inflammation panel.",
      badge: "Joint Care",
      tests: ["CBC", "ESR", "CRP", "Uric Acid", "ASO", "RF", "Calcium"],
    },
    {
      title: "Arthritis Panel 2",
      packageName:
        "ARTHRITIES PANEL - 2 (CBC, ESR, CRP, URIC ACID, ASO, RF, CALCIUM, ANA, ANTI CCP)",
      price: 2500,
      originalPrice: 3500,
      description: "Advanced arthritis panel with ANA and Anti CCP.",
      badge: "Advanced",
      tests: ["CBC", "ESR", "CRP", "Uric Acid", "ASO", "RF", "Calcium", "ANA", "Anti CCP"],
    },
    {
      title: "RA Factor",
      packageName: "RA FACTOR - QUANTITATIVE",
      price: 400,
      originalPrice: 650,
      description: "Rheumatoid arthritis screening marker.",
      tests: ["RA Factor"],
    },
    {
      title: "Uric Acid",
      packageName: "URIC ACID, SERUM",
      price: 150,
      originalPrice: 300,
      description: "Useful for gout and joint pain evaluation.",
      tests: ["Uric Acid"],
    },
  ],

  STD: [
    {
      title: "HIV I & II Card Test",
      packageName: "HIV I & II Card Test",
      price: 400,
      originalPrice: 700,
      description: "HIV screening test.",
      badge: "STD",
      tests: ["HIV I", "HIV II"],
    },
    {
      title: "HBSAG Card Test",
      packageName: "HBSAG (AUSTRALIA ANTIGEN) Card Test",
      price: 400,
      originalPrice: 700,
      description: "Hepatitis B screening test.",
      tests: ["HBSAG"],
    },
    {
      title: "HCV Card Test",
      packageName: "HCV (HEPATITIS C ANTIBODY) Card Test",
      price: 450,
      originalPrice: 750,
      description: "Hepatitis C screening test.",
      tests: ["HCV"],
    },
    {
      title: "VDRL Test",
      packageName: "VDRL TEST",
      price: 150,
      originalPrice: 300,
      description: "Syphilis screening test.",
      tests: ["VDRL"],
    },
  ],

  Anemia: [
    {
      title: "Anaemia Profile 1",
      packageName:
        "Anaemia Profile - 1 = (CBC, Peripheral Blood Smear-PBS, Retic Count, hsCRP, IRON Profile )",
      price: 1600,
      originalPrice: 2400,
      description: "Anaemia screening with CBC, smear, retic count, hsCRP and iron profile.",
      badge: "Anaemia",
      tests: ["CBC", "PBS", "Retic Count", "hsCRP", "Iron Profile"],
    },
    {
      title: "Anaemia Profile 2",
      packageName:
        "Anaemia Profile - 2 = (CBC, Peripheral Blood Smear-PBS, Retic Count, hsCRP, IRON Profile, HB Electrophoresis / Variant ) = (Patient Blood Transfusion History and Prescription Xerox required )",
      price: 4000,
      originalPrice: 5200,
      description: "Advanced anaemia profile with HB electrophoresis.",
      badge: "Advanced",
      tests: ["CBC", "PBS", "Retic Count", "hsCRP", "Iron Profile", "HB Electrophoresis"],
    },
    {
      title: "Iron Profile",
      packageName:
        "IRON Profile = (IRON, FERRITIN, Total Iron Binding Capacity (TIBC), Transferrin Saturation, Hemoglobin-HB )",
      price: 1600,
      originalPrice: 2200,
      description: "Iron deficiency evaluation.",
      tests: ["Iron", "Ferritin", "TIBC", "Transferrin Saturation", "Hemoglobin"],
    },
    {
      title: "Ferritin",
      packageName: "FERRITIN, SERUM",
      price: 800,
      originalPrice: 1200,
      description: "Iron storage marker.",
      tests: ["Ferritin"],
    },
  ],

  Antenatal: [
    {
      title: "ANC Profile - Antenatal Profile",
      packageName: "ANC PROFILE - ANTENATAL PROFILE = (CBC,ABO,SUGAR,VDRL,HIV,HBSAG,HCV,TSH,URINE R/E)",
      price: 1300,
      originalPrice: 2000,
      description: "Antenatal profile for pregnancy screening.",
      badge: "Antenatal",
      tests: ["CBC", "ABO", "Sugar", "VDRL", "HIV", "HBSAG", "HCV", "TSH", "Urine R/E"],
    },
    {
      title: "Double / Dual Marker",
      packageName: "DOUBLE / DUAL MARKER",
      price: 1800,
      originalPrice: 2500,
      description: "Pregnancy screening marker test.",
      tests: ["Double / Dual Marker"],
    },
    {
      title: "TORCH 10 Panel",
      packageName: "TORCH 10 PANEL",
      price: 2500,
      originalPrice: 3500,
      description: "Antenatal infection screening panel.",
      tests: ["TORCH 10 Panel"],
    },
    {
      title: "Blood Grouping",
      packageName: "ABO & RH (BLOOD GROUPING)",
      price: 100,
      originalPrice: 200,
      description: "ABO and RH blood group test.",
      tests: ["ABO", "RH"],
    },
  ],
};