#!/usr/bin/env node
/**
 * bk-brain CLI - Centralized Memory Installer
 * 
 * Usage:
 *   bk-brain install           # auto-detect & install
 *   bk-brain install claude    # Claude Code
 *   bk-brain install opencode # OpenCode
 *   bk-brain install openclaw # OpenClaw
 *   bk-brain install openfang # OpenFang
 *   bk-brain install hermes   # Hermes Agent
 *   bk-brain query "query"    # Query memory
 *   bk-brain stats            # Show stats
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import axios from 'axios';

const HUB_URL = process.env.BERKAHKARYA_HUB_URL || 'http://localhost:9099';

const red = (t) => `\x1b[31m${t}\x1b[0m`;
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const cyan = (t) => `\x1b[36m${t}\x1b[0m`;

function detectAgent() {
  if (process.env.CLAUDE || process.env.CLAUDE_API_KEY) return 'claude';
  if (process.env.OPC || existsSync(`${process.env.HOME}/.opencode/package.json`)) return 'opencode';
  if (process.env.OPENCLAW_HOME || existsSync(`${process.env.HOME}/.openclaw/workspace`)) return 'openclaw';
  if (existsSync(`${process.env.HOME}/.openfang`)) return 'openfang';
  if (existsSync(`${process.env.HOME}/.hermes`)) return 'hermes';
  return 'unknown';
}

function installClaude() {
  console.log(cyan('🤖 Installing for Claude Code...'));
  try {
    execSync('npm install -g bk-brain', { stdio: 'inherit' });
    console.log(green('✅ Claude Code configured!'));
    console.log('   Restart Claude Code to use MCP tools.');
  } catch (e) {
    console.log(red('⚠️ npm install failed, trying pip...'));
  }
}

function installOpenCode() {
  console.log(cyan('📦 Installing for OpenCode...'));
  execSync('npm install -g bk-brain', { stdio: 'inherit' });
  
  const skillDir = `${process.env.HOME}/.opencode/skills/core/bk-brain`;
  mkdirSync(skillDir, { recursive: true });
  
  console.log(green('✅ OpenCode configured!'));
  console.log('   Load skill: bk-brain');
}

function installOpenClaw() {
  console.log(cyan('🐙 Installing for OpenClaw...'));
  
  const cronJob = '*/15 * * * * /home/openclaw/projects/berkahkarya-hub/scripts/sync_all_memories.sh >> /var/log/memory-sync.log 2>&1';
  
  try {
    const current = execSync('crontab -l 2>/dev/null').toString();
    if (!current.includes('berkahkarya-hub')) {
      execSync(`echo "${cronJob}" | crontab -`, { stdio: 'inherit' });
    }
  } catch (e) {
    execSync(`echo "${cronJob}" | crontab -`, { stdio: 'inherit' });
  }
  
  console.log(green('✅ OpenClaw configured!'));
  console.log('   Memory sync cron installed.');
}

function installOpenFang() {
  console.log(cyan('🐺 Installing for OpenFang...'));
  execSync('npm install -g bk-brain', { stdio: 'inherit' });
  console.log(green('✅ OpenFang configured!'));
}

function installHermes() {
  console.log(cyan('🦊 Installing for Hermes Agent...'));
  execSync('npm install -g bk-brain', { stdio: 'inherit' });
  console.log(green('✅ Hermes configured!'));
}

async function queryMemory(q) {
  console.log(cyan(`🔍 Querying: ${q}`));
  try {
    const res = await axios.get(`${HUB_URL}/brain/search`, { params: { q, limit: 5 } });
    const results = res.data.results || [];
    if (results.length === 0) {
      console.log('No results found.');
    } else {
      results.forEach((r, i) => {
        console.log(`\n${i + 1}. [${r.service || r.source}] ${(r.content || '').slice(0, 150)}...`);
      });
    }
  } catch (e) {
    console.log(red(`Error: ${e.message}`));
  }
}

async function showStats() {
  console.log(cyan('📊 Hub Stats'));
  try {
    const res = await axios.get(`${HUB_URL}/brain/stats`);
    const stats = res.data;
    console.log(`   GBrain: ${stats.gbrain?.page_count || 0} pages`);
    console.log(`   MemPalace: ${stats.mempalace?.total_drawers || 0} drawers`);
    console.log(`   FTS5: ${stats.fts5?.indexed || 0} indexed`);
  } catch (e) {
    console.log(red(`Error: ${e.message}`));
  }
}

// Main
const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
  console.log(`
${cyan('bk-brain')} - Centralized Memory CLI

${green('Usage:')}
  bk-brain install             Auto-detect & install
  bk-brain install claude     Claude Code
  bk-brain install opencode   OpenCode
  bk-brain install openclaw   OpenClaw
  bk-brain install openfang   OpenFang
  bk-brain install hermes     Hermes Agent
  bk-brain query <text>      Query memory
  bk-brain stats             Show hub stats
  `);
  process.exit(0);
}

if (cmd === 'install') {
  const target = args[1] || detectAgent();
  console.log(cyan(`🎯 Target: ${target}`));
  
  switch (target) {
    case 'claude': installClaude(); break;
    case 'opencode': installOpenCode(); break;
    case 'openclaw': installOpenClaw(); break;
    case 'openfang': installOpenFang(); break;
    case 'hermes': installHermes(); break;
    default:
      console.log(green('Installing generic package...'));
      execSync('npm install -g bk-brain', { stdio: 'inherit' });
  }
} else if (cmd === 'query') {
  queryMemory(args.slice(1).join(' '));
} else if (cmd === 'stats') {
  showStats();
} else {
  console.log(red(`Unknown command: ${cmd}`));
}