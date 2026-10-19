# 🔬 เล่มที่ 7: ปัญญาประดิษฐ์เพื่อชีวสารสนเทศ จีโนมิกส์ และวิทยาศาสตร์ชีวภาพเชิงคำนวณ
### Series of AI SKILL — Volume 07: AI for Bioinformatics, Genomics & Computational Life Sciences

**ผู้เขียน:** ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา  
**สำนักพิมพ์:** ศูนย์ความเป็นเลิศด้านสิ่งแวดล้อมและพลังงาน (LEQs) มหาวิทยาลัยราชภัฏรำไพพรรณี  
**ขนาดรูปเล่ม:** 6x9 นิ้ว (152.4 x 228.6 มม.) มาตรฐานสากล

---

## 🎯 วัตถุประสงค์เชิงพฤติกรรม (OBE Learning Outcomes)
1. สามารถเข้าถึง วิเคราะห์ และประเมินความเชื่อมั่นของโครงสร้าง 3 มิติของโปรตีนจาก AlphaFold DB (ค่า pLDDT) และสืบค้นความคล้ายคลึงเชิงโครงสร้างด้วย Foldseek API
2. สามารถทำนายผลกระทบของการกลายพันธุ์ระดับยีนและนอนโค้ดดิ้ง (Non-coding Variants) ต่อการแสดงออกของยีนและโครมาตินด้วย AlphaGenome API และ Ensembl VEP
3. สามารถประยุกต์ใช้โมเดลเคมีสารสนเทศ (Cheminformatics) ในการคัดกรองสารชีวโมเลกุล การค้นหาเป้าหมายยา และเรนเดอร์ภาพโมเลกุลด้วย PyMOL

---

## 📑 สารบัญบทเรียน (Table of Contents)

### บทที่ 1: การทำนายและการวิเคราะห์โครงสร้าง 3 มิติของโปรตีนด้วย AlphaFold DB
- 1.1 สถาปัตยกรรม Evoformer และโมเดลจำลองโครงสร้างโปรตีน 3 มิติ
- 1.2 การอ่านค่าดัชนีความเชื่อมั่น pLDDT และการวิเคราะห์ขอบเขตโดเมน (Domain Boundaries)
- 1.3 การค้นหาโปรตีนที่มีโครงสร้างคล้ายคลึงกันในระดับจีโนมด้วย Foldseek Structural Search

### บทที่ 2: การทำนายผลกระทบของการกลายพันธุ์ระดับจีโนมด้วย AlphaGenome
- 2.1 การวิเคราะห์ผลของการกลายพันธุ์ในบริเวณควบคุมยีน (Promoters and Enhancers)
- 2.2 การประเมินผลกระทบต่อการเข้าถึงของโครมาติน (Chromatin Accessibility: DNASE)
- 2.3 การแปลรหัสจีโนมิกส์และจัดกลุ่มความรุนแรงของโรคด้วย Ensembl VEP และ ClinVar

### บทที่ 3: เคมีสารสนเทศและการค้นหายาใหม่ด้วย ChEMBL, PubChem และ PyMOL
- 3.1 ฐานข้อมูลสารออกฤทธิ์ทางชีวภาพ ChEMBL และการวิเคราะห์ค่าความสัมพันธ์ IC50/Ki
- 3.2 การสืบค้นโครงสร้างทางเคมีและคุณสมบัติโมเลกุลด้วย PubChem API
- 3.3 การสร้างภาพจำลองปฏิสัมพันธ์โปรตีนและลิแกนด์ (Docking Interaction Visualization) ด้วย PyMOL

---

## 🚀 การคอมไพล์เล่ม (XeLaTeX)
```bash
/Library/TeX/texbin/xelatex -interaction=nonstopmode main.tex
```

## 🛠️ รายการสกิลต้นฉบับและไฟล์ SKILL.md ประจำเล่ม (Agent Skills Inventory)

| ลำดับ | ชื่อสกิล (Skill Name) | รายละเอียดและขอบเขตความสามารถ | ลิงก์ไฟล์ข้อกำหนด (SKILL.md) |
| :---: | :--- | :--- | :--- |
| 1 | `alphafold-database-fetch-and-analyze` | > Retrieve and analyze AlphaFold predicted structures for a protein. Use when the user provides a specific UniProt Accession ID and wants st... | [📄 ดูเนื้อหา SKILL.md](skills/alphafold-database-fetch-and-analyze/SKILL.md) |
| 2 | `alphagenome-single-variant-analysis` | > Analyzes genetic variant effects on gene expression (RNA-seq), chromatin accessibility (DNASE), histone marks (ChIP), and transcription fa... | [📄 ดูเนื้อหา SKILL.md](skills/alphagenome-single-variant-analysis/SKILL.md) |
| 3 | `chembl-database` | > Query the ChEMBL database for bioactive molecules, drug targets, bioactivity data, approved drugs, and chemical structures. Use when the u... | [📄 ดูเนื้อหา SKILL.md](skills/chembl-database/SKILL.md) |
| 4 | `clinical-trials-database` | > Query ClinicalTrials.gov via APIv2. Use when you want to search for trials by condition, drug, location, status, or phase; retrieve trial ... | [📄 ดูเนื้อหา SKILL.md](skills/clinical-trials-database/SKILL.md) |
| 5 | `clinvar-database` | > Use when needing clinical significance, pathogenicity classifications (e.g., Pathogenic, Benign, VUS), clinical evidence rationales, or fi... | [📄 ดูเนื้อหา SKILL.md](skills/clinvar-database/SKILL.md) |
| 6 | `dbsnp-database` | > Use when you want to look up, map, and search for short genetic variants (SNPs, indels) in NCBI's dbSNP database. Resolves between rsIDs, ... | [📄 ดูเนื้อหา SKILL.md](skills/dbsnp-database/SKILL.md) |
| 7 | `embl-ebi-ols` | > Query and search the EMBL-EBI Ontology Lookup Service (OLS) for biomedical ontology terms, definitions, and hierarchies across 250+ ontolo... | [📄 ดูเนื้อหา SKILL.md](skills/embl-ebi-ols/SKILL.md) |
| 8 | `encode-ccres-database` | > Query the ENCODE Registry of cis-Regulatory Elements (cCREs) via the SCREEN GraphQL API, or make custom queries to the ENCODE Portal REST ... | [📄 ดูเนื้อหา SKILL.md](skills/encode-ccres-database/SKILL.md) |
| 9 | `ensembl-database` | > Query the Ensembl database to resolve gene, transcript, and protein IDs, fetch genomic or protein sequences, retrieve gene structures (exo... | [📄 ดูเนื้อหา SKILL.md](skills/ensembl-database/SKILL.md) |
| 10 | `foldseek-structural-search` | > Performs 3D structural searches of proteins against various databases (PDB, AlphaFold, CATH, MGnify, etc.) using the Foldseek API. Use ONL... | [📄 ดูเนื้อหา SKILL.md](skills/foldseek-structural-search/SKILL.md) |
| 11 | `gnomad-database` | > Query the Genome Aggregation Database (gnomAD). Use when determining the rarity or allele frequency of specific genetic variants, retrievi... | [📄 ดูเนื้อหา SKILL.md](skills/gnomad-database/SKILL.md) |
| 12 | `gtex-database` | > Use when you want to retrieve quantitative RNA expression data and variant eQTL information from the GTEx (Genotype-Tissue Expression) Pro... | [📄 ดูเนื้อหา SKILL.md](skills/gtex-database/SKILL.md) |
| 13 | `human-protein-atlas-database` | > Use when you want to retrieve semi-quantitative protein expression and spatial localisation data from the Human Protein Atlas (HPA). | [📄 ดูเนื้อหา SKILL.md](skills/human-protein-atlas-database/SKILL.md) |
| 14 | `jaspar-database` | > Query the JASPAR database for Transcription Factor (TF) binding profiles. Use when retrieving Position Frequency Matrices (PFMs) or Positi... | [📄 ดูเนื้อหา SKILL.md](skills/jaspar-database/SKILL.md) |
| 15 | `literature-search-arxiv` | > Search for scientific papers, preprints, and publications on arXiv. Extract metadata, abstracts, and download full-text PDFs or HTML versi... | [📄 ดูเนื้อหา SKILL.md](skills/literature-search-arxiv/SKILL.md) |
| 16 | `literature-search-biorxiv` | > Browse, filter, and download life sciences, biology, and medical preprints from bioRxiv and medRxiv. Supports fetching paper metadata by D... | [📄 ดูเนื้อหา SKILL.md](skills/literature-search-biorxiv/SKILL.md) |
| 17 | `literature-search-europepmc` | > Search Europe PMC for scientific literature and download open-access full texts and PDFs. Retrieve full-text XML/plain text by PMCID, get ... | [📄 ดูเนื้อหา SKILL.md](skills/literature-search-europepmc/SKILL.md) |
| 18 | `literature-search-openalex` | > Query the OpenAlex scholarly database for research papers, authors, institutions, topics, sources, publishers, funders, geo-locations, and... | [📄 ดูเนื้อหา SKILL.md](skills/literature-search-openalex/SKILL.md) |
| 19 | `ncbi-sequence-fetch` | > Retrieve protein and nucleotide sequences from NCBI databases using E-utilities. Supports direct accession lookup, CDS translation, gene+o... | [📄 ดูเนื้อหา SKILL.md](skills/ncbi-sequence-fetch/SKILL.md) |
| 20 | `openfda-database` | > Query, search, and download data from the openFDA API for drugs, devices, foods, tobacco, cosmetics, animal and veterinary products, subst... | [📄 ดูเนื้อหา SKILL.md](skills/openfda-database/SKILL.md) |
| 21 | `opentargets-database` | > Query Open Targets Platform for target-disease associations, drug target discovery, tractability/safety data, genetics/omics evidence, kno... | [📄 ดูเนื้อหา SKILL.md](skills/opentargets-database/SKILL.md) |
| 22 | `pdb-database` | > Use when you want to search for or download experimentally-determined 3D structures for biomolecules (proteins, nucleic acids, bound ligan... | [📄 ดูเนื้อหา SKILL.md](skills/pdb-database/SKILL.md) |
| 23 | `predictingthepast` | > Ancient text restoration, attribution, dating, contextualization, and embedding via Aeneas (Latin) / Ithaca (Ancient Greek). Use when aske... | [📄 ดูเนื้อหา SKILL.md](skills/predictingthepast/SKILL.md) |
| 24 | `protein-sequence-msa` | > Performs multiple sequence alignment of proteins with EBI Clustal Omega. Use when you need to align multiple sequences to assess similarit... | [📄 ดูเนื้อหา SKILL.md](skills/protein-sequence-msa/SKILL.md) |
| 25 | `protein-sequence-similarity-search` | > Searches for homologous protein sequences using MMseqs2 (fast, default) or BLAST (comprehensive, fallback). Trigger this whenever the user... | [📄 ดูเนื้อหา SKILL.md](skills/protein-sequence-similarity-search/SKILL.md) |
| 26 | `pubchem-database` | > Query PubChem, search by name/CID/SMILES, retrieve properties, similarity/substructure searches, bioactivity, for cheminformatics. Use whe... | [📄 ดูเนื้อหา SKILL.md](skills/pubchem-database/SKILL.md) |
| 27 | `pubmed-database` | Search PubMed for scientific literature, including published clinical trials. Fetch abstracts and full text. Link published research to biol... | [📄 ดูเนื้อหา SKILL.md](skills/pubmed-database/SKILL.md) |
| 28 | `pymol` | > Visualize, analyze, and render protein and molecular structures using PyMOL. Use when the user wants to create images of protein structure... | [📄 ดูเนื้อหา SKILL.md](skills/pymol/SKILL.md) |
| 29 | `quickgo-database` | > Query the QuickGO and Evidence & Conclusion Ontology (ECO) REST API. Use this when you need to map genes to biological processes, molecula... | [📄 ดูเนื้อหา SKILL.md](skills/quickgo-database/SKILL.md) |
| 30 | `reactome-database` | > Query the Reactome database (Analysis and Content Services). Use when the user asks about pathway analysis, gene list enrichment, retrievi... | [📄 ดูเนื้อหา SKILL.md](skills/reactome-database/SKILL.md) |
| 31 | `science-skills-common` | Shared Python package for Science Skills, currently containing http_client -- a unified HTTP client with rate limiting, retries, and exponen... | [📄 ดูเนื้อหา SKILL.md](skills/science-skills-common/SKILL.md) |
| 32 | `string-database` | > Query the STRING database for protein-protein interactions (PPIs), functional enrichment, and homology. Use when the user asks about inter... | [📄 ดูเนื้อหา SKILL.md](skills/string-database/SKILL.md) |
| 33 | `ucsc-conservation-and-tfbs` | > Fetch Evolutionary Conservation scores (phyloP, phastCons) and Transcription Factor Binding Sites (TFBS) from the UCSC Genome Browser. Use... | [📄 ดูเนื้อหา SKILL.md](skills/ucsc-conservation-and-tfbs/SKILL.md) |
| 34 | `unibind-database` | Queries the UniBind database for experimentally validated transcription factor (TF) binding sites. Use when retrieving direct TF-DNA interac... | [📄 ดูเนื้อหา SKILL.md](skills/unibind-database/SKILL.md) |
| 35 | `uniprot-database` | Access protein metadata, function, taxonomy, and sequences across UniProtKB, UniParc, and UniRef. Use when searching for proteins, mapping i... | [📄 ดูเนื้อหา SKILL.md](skills/uniprot-database/SKILL.md) |
