import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)

const cache = new Map<string, { html: string; timestamp: number }>()

const CACHE_MAX = 200

function evictOldest() {
    if (cache.size <= CACHE_MAX) return
    let oldest = ""
    let oldestTime = Infinity
    for (const [key, val] of cache) {
        if (val.timestamp < oldestTime) {
            oldestTime = val.timestamp
            oldest = key
        }
    }
    if (oldest) cache.delete(oldest)
}

export async function markdownToHtml(markdown: string): Promise<string> {
    const cached = cache.get(markdown)
    if (cached) {
        cached.timestamp = Date.now()
        return cached.html
    }

    const file = await processor.process(markdown)
    const html = String(file)

    evictOldest()
    cache.set(markdown, { html, timestamp: Date.now() })

    return html
}

export function extractTitle(markdown: string): string {
    const match = markdown.match(/^#\s+(.+)$/m)
    if (match) return match[1].trim()
    const firstLine = markdown.split("\n").find((l) => l.trim().length > 0)
    return firstLine?.trim() ?? "Untitled"
}

export function clearMarkdownCache() {
    cache.clear()
}
