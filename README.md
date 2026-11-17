# Universal RSS & Atom Feed Scraper 📡

Effortlessly convert any RSS, Atom, Podcast, Substack, Medium, WordPress, or YouTube feed into structured JSON/CSV data.

Designed for automated news feeds, Slack/Discord notification bots, AI summarizer pipelines, and Zapier/Make automations.

---

## ⚡ Key Features

- **Universal Compatibility**: Supports RSS 0.9x, RSS 2.0, RDF, and Atom 1.0 feed standards.
- **Enriched Article Data**: Article title, destination URL, published date (ISO), author/creator, tags/categories, content snippet, and full HTML content.
- **Media & Podcast Enclosures**: Automatically captures audio/video attachment URLs and mime types from podcast feeds.
- **HTML Sanitization**: Cleans and strips raw HTML tags into ready-to-read plaintext summaries.
- **Zero Configuration**: Just provide feed URLs and start extracting instantly.

---

## 📥 Input Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `feedUrls` | Array | `["https://news.ycombinator.com/rss", "https://techcrunch.com/feed/"]` | List of RSS or Atom URLs. |
| `maxItemsPerFeed` | Integer | `30` | Maximum number of items to extract per feed (1 to 200). |
| `cleanHtml` | Boolean | `true` | Strip HTML tags from summary snippets. |

---

## 📤 Output Sample

```json
{
  "feedUrl": "https://techcrunch.com/feed/",
  "feedTitle": "TechCrunch",
  "title": "Anthropic updates Claude with new capabilities",
  "link": "https://techcrunch.com/2026/04/10/anthropic-claude-update/",
  "pubDate": "2026-04-10T14:30:00.000Z",
  "author": "Frederic Lardinois",
  "contentSnippet": "Anthropic today announced a major update to its Claude platform...",
  "guid": "https://techcrunch.com/?p=1234567",
  "categories": ["Artificial Intelligence", "Startups"],
  "enclosure": null,
  "scrapedAt": "2026-11-17T12:00:00.000Z"
}
```

---

## 💡 Practical Applications

1. **AI Digest Automation**: Pull 10 daily RSS feeds into Make/Zapier, summarize them with GPT/Claude, and deliver an automated morning email.
2. **Podcast Monitoring**: Monitor new podcast episodes and download mp3 audio URLs via enclosure metadata.
3. **Multi-Source News Aggregator**: Build real-time news aggregators without managing complex XML parsers.
