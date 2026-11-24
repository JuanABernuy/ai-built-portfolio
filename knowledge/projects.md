# Projects: Juan Andrés Bernuy Navarrete

## MCP server for Cin7 (mcp-api-server)
- What it is: a read-only MCP (Model Context Protocol) server in Python, built with FastMCP and packaged with Docker.
- What it does: gives Claude access to the Cin7 Core API so the team can ask about orders, stock, purchasing and customers through a single governed API connection.
- Why read-only: AI-assisted access to business data without any write access to the ERP.
- Status: built at Bullboat; Juan plans to publish an anonymised version on his personal GitHub (repo mcp-api-server).

## Cin7 Core to Azure SQL data pipeline (Bullboat, anonymised)
- What it is: an ingestion system in Azure Data Factory that loads Cin7 Core data into Azure SQL for Power BI.
- How it works: an orchestrator pipeline reads a configuration table and runs one generic ingestion pipeline per entity. Each load is incremental, using a watermark on the last-modified date, and pages are fetched in parallel.
- Layers: landing (raw JSON) → staging (clean table, reloaded every run) → core (final table, updated with MERGE). Each entity has its own stored procedures.
- Entities: products, customers and suppliers are live; sales are designed as seven related tables (sale header, order lines, fulfilments, pick lines, pack lines, shipments and invoices) so Power BI can use them without duplicating data.
- Reporting: a star schema in Power BI (customer, product and calendar dimensions; order lines as the fact table).
- Bullboat has authorised Juan to publish an anonymised version of this project on his personal GitHub.

## Credit card fraud detection (in progress)
- Dataset: Kaggle Credit Card Fraud.
- Structure: three parts — exploratory data analysis, preprocessing and modelling — in Jupyter with Python.
- Work done so far: exact duplicates removed before the train/test split; skewness and kurtosis analysed for Time and Amount (the V features come from a PCA); mutual information used to look for non-linear relationships between the most discriminant features.
- Approach: a first model trained on all features, then improved iteratively.
- No final performance metrics are published yet.

## Cuadra (own project, in development)
- What it is: a B2B invoicing and accounting SaaS for freelancers, accounting firms and small businesses.
- Includes an AI assistant and a mascot called Cuadri. The website and a promotional video are in progress.

## This portfolio website
- Built with React, TypeScript, Vite and Tailwind. It tells Juan's story as an auto-playing presentation and includes this assistant, which answers questions using RAG over his CV with Google Gemini.
