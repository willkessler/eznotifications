import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(markdownText) {
  const rawMarkup = marked(markdownText);
  return { __html: DOMPurify.sanitize(rawMarkup) };
};
