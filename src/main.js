import { Actor } from 'apify';
import { gotScraping } from 'got-scraping';
import * as cheerio from 'cheerio';

await Actor.init();

const input = await Actor.getInput() || {};
const rawFeedUrls = input.feedUrls || ['https://news.ycombinator.com/rss', 'https://techcrunch.com/feed/'];
const maxItemsPerFeed = Math.min(input.maxItemsPerFeed || 30, 200);
const cleanHtml = input.cleanHtml !== false;

const feedUrls = rawFeedUrls.map(f => {
    if (typeof f === 'string') return f.trim();
    if (f && typeof f === 'object' && f.url) return f.url.trim();
    return null;
}).filter(u => u && (u.startsWith('http://') || u.startsWith('https://')));

console.log(`[RSS Scraper] Starting extraction for ${feedUrls.length} feeds (max per feed: ${maxItemsPerFeed})...`);

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toISOString();
}

const allItems = [];

for (const feedUrl of feedUrls) {
    try {
        console.log(`[RSS Scraper] Fetching feed: ${feedUrl}`);
        const response = await gotScraping({
            url: feedUrl,
            timeout: { request: 15000 },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Apify-Universal-RSS/1.0',
                'Accept': 'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml, */*',
            },
        });

        const $ = cheerio.load(response.body, { xmlMode: true });

        const isAtom = $('feed').length > 0;
        const feedTitle = $('channel > title, feed > title').first().text().trim() || feedUrl;
        const feedDescription = $('channel > description, feed > subtitle').first().text().trim() || null;

        const entries = isAtom ? $('feed > entry') : $('channel > item, item');
        console.log(`[RSS Scraper] Found ${entries.length} items in '${feedTitle}' (${isAtom ? 'Atom' : 'RSS'})...`);

        let count = 0;
        entries.each((_, el) => {
            if (count >= maxItemsPerFeed) return false;

            const itemElem = $(el);
            let title = itemElem.find('title').first().text().trim();
            let link = '';
            let pubDateRaw = '';
            let author = '';
            let rawContent = '';
            let guid = '';
            let enclosure = null;

            if (isAtom) {
                link = itemElem.find('link[rel="alternate"]').attr('href') || itemElem.find('link').first().attr('href') || '';
                pubDateRaw = itemElem.find('published, updated').first().text().trim();
                author = itemElem.find('author > name').first().text().trim();
                rawContent = itemElem.find('content').first().text().trim() || itemElem.find('summary').first().text().trim();
                guid = itemElem.find('id').first().text().trim();
            } else {
                link = itemElem.find('link').first().text().trim();
                pubDateRaw = itemElem.find('pubDate').first().text().trim();
                author = itemElem.find('dc\\:creator, creator, author').first().text().trim();
                rawContent = itemElem.find('content\\:encoded, encoded').first().text().trim() || itemElem.find('description').first().text().trim();
                guid = itemElem.find('guid').first().text().trim();

                const enc = itemElem.find('enclosure');
                if (enc.length > 0) {
                    enclosure = {
                        url: enc.attr('url') || null,
                        type: enc.attr('type') || null,
                        length: enc.attr('length') || null,
                    };
                }
            }

            const categories = [];
            itemElem.find('category').each((_, cat) => {
                const term = $(cat).attr('term') || $(cat).text().trim();
                if (term && !categories.includes(term)) categories.push(term);
            });

            const contentSnippet = cleanHtml ? stripHtml(rawContent).slice(0, 500) : rawContent.slice(0, 500);

            allItems.push({
                feedUrl,
                feedTitle,
                title: title || 'Untitled',
                link: link || null,
                pubDate: parseDate(pubDateRaw),
                author: author || null,
                contentSnippet: contentSnippet || null,
                guid: guid || link || null,
                categories,
                enclosure,
                scrapedAt: new Date().toISOString(),
            });

            count++;
        });

    } catch (err) {
        console.error(`[RSS Scraper] Failed to fetch feed ${feedUrl}:`, err.message);
    }
}

console.log(`[RSS Scraper] Extracted total ${allItems.length} items from ${feedUrls.length} feeds. Pushing to dataset...`);
if (allItems.length > 0) {
    await Actor.pushData(allItems);
}

await Actor.exit();
