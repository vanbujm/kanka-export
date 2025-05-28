import {mkdirSync, writeFileSync} from 'fs';
import {join} from 'path';
import {config} from 'dotenv';
import {NodeHtmlMarkdown} from 'node-html-markdown';

config();

const API_TOKEN = process.env.API_TOKEN;
const CAMPAIGN_ID = process.env.CAMPAIGN_ID;
const KANKA_DOMAIN = "https://api.kanka.io"
const BASE_URL = `${KANKA_DOMAIN}/1.0/campaigns/${CAMPAIGN_ID}`;

const fetchData = async (url: string) => {
    let data: any[] = [];

    try {
        console.info(`Fetching data from ${url}`)
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const jsonData = await response.json();
        data = data.concat(jsonData.data);
        if (jsonData.links.next) {
            console.info(`    Fetching next page: ${jsonData.links.next}`);
            const subData = await fetchData(jsonData.links.next)
            data = data.concat(subData);
        }
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
    }

    return data;
};

const writeMarkdownFile = (directory: string, filename: string, content: string) => {
    mkdirSync(directory, {recursive: true});
    writeFileSync(join(directory, filename), content, 'utf8');
};

const replaceReferences = (content: string, allData: Record<string, any[]>) => {
    return content.replace(/\[(\w+):(\d+)]/g, (match, type, id) => {

        const dataRef = allData[type]?.find((item: any) => item.entity_id === parseInt(id));
        if(!dataRef?.name) {
            console.error(`Error replacing reference: ${match} with ${dataRef?.name}`);
        }
        return dataRef?.name ? dataRef.name : match;
    });

};

const processEntity = (type: string, entity: any, allData: Record<string, any[]>) => {
    const hierarchy = entity.parent_id ? `${type}/${entity.parent_id}` : type;
    const directory = join('campaign-data', hierarchy);
    const filename = `${entity.name.replace(/[\\/:*?"<>|]/g, '')}.md`;

    const rawContent = entity.entry || 'No content available.';

    const contentWithRefs = replaceReferences(rawContent, allData);
    const markdownContent = NodeHtmlMarkdown.translate(
        contentWithRefs, 
        undefined, 
        {
            'iframe': ({node}) => ({
                content: `${node}`,
                preserveIfEmpty: true
            })
        }
    );

    const content = `# ${entity.name}\n\n${markdownContent}`;
    writeMarkdownFile(directory, filename, content);
};

const fetchAllData = async () => {
    const endpoints = {
        characters: "character",
        locations: "location",
        items: "item",
        notes: "note",
        events: "event",
        creatures: "creature",
        races: "race",
        quests: "quest",
        organisations: "organisation",
        abilities: "ability",
        families: "family"
    }

    const allData: Record<string, any[]> = {}

    for (const endpoint of Object.keys(endpoints)) {
        const url = `${BASE_URL}/${endpoint}`;
        const data = await fetchData(url);
        const baseName = endpoints[endpoint]
        allData[baseName] = data;
    }

    for (const [type, entities] of Object.entries(allData)) {
        for (const entity of entities) {
            processEntity(type, entity, allData);
        }
    }

};

fetchAllData();
