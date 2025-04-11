# Kanka Campaign Exporter 🚀

This project is a **Kanka Campaign Exporter** that fetches campaign data from the Kanka API and converts it into 
Markdown files for offline use or further processing.

## Features

- Fetches data from the Kanka API, including characters, locations, items, and more.
- Converts HTML content from Kanka into Markdown using `node-html-markdown`.
- Resolves references between entities within the campaign.
- Organizes exported data into a structured directory format.
- Combines multiple Markdown files into a single file.

## Prerequisites

- Node.js
- npm
- A Kanka API token

## Setup

```bash
npm i
# Add your Kanka API token to the .env file under the API_TOKEN
touch .env

npm run kanka-export

# Combine output files into a single file
npm run combine
```