export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import net from 'net';

function isPrivateIp(ip: string): boolean {
    if (net.isIPv4(ip)) {
        const [a, b] = ip.split('.').map(Number);
        return (
            a === 10 ||
            a === 127 ||
            (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            a === 0
        );
    }
    // IPv6: loopback, link-local, unique local
    return ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd');
}

// ponytail: DNS-lookup check, not a proxy-level guard — a rebinding attack that
// resolves differently between this check and the fetch() below still slips through.
// Upgrade to a real egress proxy/allowlist if this endpoint becomes higher-value.
async function assertPublicUrl(rawUrl: string): Promise<URL> {
    const url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Only http/https URLs are allowed');
    }
    const { address } = await dns.lookup(url.hostname);
    if (isPrivateIp(address)) {
        throw new Error('URL resolves to a private or internal address');
    }
    return url;
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        await assertPublicUrl(url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Simple fetch with proper headers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        
        // Basic content extraction
        let textContent = html
            // Remove scripts and styles
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            // Remove HTML tags
            .replace(/<[^>]*>/g, ' ')
            // Clean up whitespace
            .replace(/\s+/g, ' ')
            .trim();

        // Limit content length
        if (textContent.length > 5000) {
            textContent = textContent.substring(0, 5000) + '...';
        }

        return NextResponse.json({ 
            content: textContent,
            url: url,
            timestamp: new Date().toISOString(),
            length: textContent.length
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ 
            error: 'Failed to scrape website',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}