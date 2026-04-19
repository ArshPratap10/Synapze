import pg from 'pg';
import 'dotenv/config';

async function testConnection(url, label) {
    console.log(`Testing ${label}...`);
    const client = new pg.Client({ connectionString: url });
    try {
        await client.connect();
        console.log(`✅ ${label} connected!`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`❌ ${label} failed: ${err.message}`);
        return false;
    }
}

const pass = "Arsh%40Synapze";
const project = "iwfvigxdmgpvxwnicreo";

const urls = [
    { label: "Current .env URL", url: process.env.DATABASE_URL },
    { label: "Pooler Port 5432", url: `postgresql://postgres.${project}:${pass}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres` },
    { label: "Direct URL (Standard Format)", url: `postgresql://postgres:${pass}@db.${project}.supabase.co:5432/postgres` }
];

async function run() {
    for (const item of urls) {
        await testConnection(item.url, item.label);
    }
}

run();
