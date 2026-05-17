import natural from 'natural';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import https from 'https';
import http from 'http';
import Documentation from '../models/Documentation.js';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// ─── Text extraction ──────────────────────────────────────────────────────────

async function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

export async function extractText(url) {
  try {
    const buf = await fetchBuffer(url);
    const lower = url.toLowerCase().split('?')[0];

    if (lower.endsWith('.pdf') || url.includes('/raw/') || url.includes('pdf')) {
      const data = await pdfParse(buf);
      return data.text ?? '';
    }
    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer: buf });
      return result.value ?? '';
    }
    // Plain text fallback
    return buf.toString('utf8');
  } catch (err) {
    console.error('extractText error:', err.message);
    return '';
  }
}

// ─── TF-IDF cosine similarity ─────────────────────────────────────────────────

function tokenize(text) {
  return tokenizer.tokenize((text ?? '').toLowerCase());
}

export function computeSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const tfidf = new TfIdf();
  tfidf.addDocument(tokenize(text1));
  tfidf.addDocument(tokenize(text2));

  // Build term set from both docs
  const terms = new Set([
    ...tokenize(text1),
    ...tokenize(text2),
  ]);

  let dot = 0, mag1 = 0, mag2 = 0;

  for (const term of terms) {
    const v1 = tfidf.tfidf(term, 0);
    const v2 = tfidf.tfidf(term, 1);
    dot  += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  if (mag1 === 0 || mag2 === 0) return 0;
  const cosine = dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  return Math.min(100, Math.round(cosine * 100));
}

// ─── Compare new text against all submitted report docs ───────────────────────

export async function checkAllProjects(newText, excludeProjectId) {
  if (!newText || newText.length < 100) return { maxScore: 0, matchedProjectId: null };

  // Fetch all report-type docs except the current project
  const allDocs = await Documentation.find({
    documentType: 'report',
    isLatest: true,
    projectId: { $ne: excludeProjectId },
  }).select('projectId url').lean();

  let maxScore = 0;
  let matchedProjectId = null;

  for (const doc of allDocs) {
    try {
      const existingText = await extractText(doc.url);
      if (!existingText || existingText.length < 100) continue;
      const score = computeSimilarity(newText, existingText);
      if (score > maxScore) {
        maxScore = score;
        matchedProjectId = doc.projectId;
      }
    } catch {
      // skip docs that can't be fetched
    }
  }

  return { maxScore, matchedProjectId };
}
