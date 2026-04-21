/**
 * Centralized Memory Hub - Node.js Client
 * 
 * IQ 145 Pattern:
 * - BEFORE any task: query hub for context
 * - INJECT retrieved memories into your thinking
 * - EXECUTE with context
 * - AFTER task: optionally write result back
 * 
 * Usage:
 *   import { queryHub, injectContext, addToHub } from './index.js';
 *   
 *   // Before executing task
 *   const memories = await queryHub("what about X?");
 *   const context = injectContext(memories);
 *   const prompt = `${context}\n\nUser: ${message}`;
 *   
 *   // Execute with context...
 *   
 *   // After task completes
 *   await addToHub(`Result: ${result}`, "opencode");
 */

import axios from 'axios';

const HUB_URL = process.env.BERKAHKARYA_HUB_URL || 'http://localhost:9099';
const DEFAULT_SERVICE = process.env.BERKAHKARYA_SERVICE || 'opencode';

/**
 * Query hub BEFORE executing any task
 * @param {string} query - Search query
 * @param {object} options - { service, limit, method }
 * @returns {Promise<Array>} Array of memory objects
 */
export async function queryHub(query, options = {}) {
  const { service, limit = 5, method = 'hybrid' } = options;
  
  const params = { q: query, limit, method };
  if (service) params.service = service;
  
  try {
    const response = await axios.get(`${HUB_URL}/brain/search`, { params });
    return response.data.results || [];
  } catch (error) {
    console.error('⚠️ Hub query failed:', error.message);
    return [];
  }
}

/**
 * Format retrieved memories as injectable context
 * @param {Array} memories - Output from queryHub()
 * @param {number} maxItems - Maximum memories to include
 * @returns {string} Formatted context string
 */
export function injectContext(memories, maxItems = 5) {
  if (!memories || memories.length === 0) return '';
  
  const lines = ['📚 RELEVANT HISTORY:'];
  
  memories.slice(0, maxItems).forEach((mem, i) => {
    let content = mem.content || '';
    if (content.length > 400) {
      content = content.slice(0, 400) + '...';
    }
    const service = mem.service || mem.source || 'unknown';
    lines.push(`\n${i + 1}. [${service}] ${content}`);
  });
  
  return lines.join('\n');
}

/**
 * Write result BACK to hub after task completes
 * @param {string} content - What to store
 * @param {string} service - Source service name
 * @param {object} options - { wing, room, tags }
 * @returns {Promise<object>} Response or null
 */
export async function addToHub(content, service = DEFAULT_SERVICE, options = {}) {
  const { wing = 'general', room = 'general', tags } = options;
  
  const data = { content, service, wing, room };
  if (tags) data.tags = tags;
  
  try {
    const response = await axios.post(`${HUB_URL}/brain/add`, data);
    return response.data;
  } catch (error) {
    console.error('⚠️ Hub add failed:', error.message);
    return null;
  }
}

/**
 * Get hub statistics
 * @returns {Promise<object>} Stats object
 */
export async function getHubStats() {
  try {
    const response = await axios.get(`${HUB_URL}/brain/stats`);
    return response.data;
  } catch (error) {
    console.error('⚠️ Hub stats failed:', error.message);
    return {};
  }
}

/**
 * CLI when run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv.slice(2).join(' ') || 'test';
  console.log(`🔍 Querying hub: ${query}`);
  
  queryHub(query, { limit: 3 })
    .then(memories => {
      if (memories.length > 0) {
        console.log(`\n📚 Found ${memories.length} memories:\n`);
        memories.forEach(mem => {
          console.log(`  - [${mem.service || 'unknown'}] ${mem.content?.slice(0, 150)}...`);
        });
      } else {
        console.log('⚠️ No results found');
      }
    })
    .catch(console.error);
}

export default {
  queryHub,
  injectContext,
  addToHub,
  getHubStats
};