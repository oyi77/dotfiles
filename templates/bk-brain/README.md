# hub-memory

Bidirectional memory client for Node.js. Query BEFORE acting.

## Install

```bash
npm install @oyi77/centralized-memory
# or
npm install axios
```

## Usage

```javascript
import { queryHub, injectContext, addToHub } from '@oyi77/centralized-memory';

// 1. Query BEFORE task
const memories = await queryHub("what do we know about X?");

// 2. Inject context
const context = injectContext(memories);
const prompt = `${context}\n\n${userMessage}`;

// 3. Execute with context...

// 4. Write back AFTER
await addToHub(`Result: ${result}`, "opencode", { wing: "tasks" });
```

## API

| Function | Args | Returns |
|----------|------|---------|
| queryHub | (query, options) | Promise<memories[]> |
| injectContext | (memories, maxItems) | string |
| addToHub | (content, service, options) | Promise |

## Options

```javascript
{
  service: "opencode", // filter by service
  limit: 5,            // max results  
  method: "hybrid"    // search method
}
```