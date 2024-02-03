import { marked } from 'marked';
import DOMPurify from 'dompurify';

const previewCaveatMd = "\n\n#### _Please note: this is only a demo, how you display notifications on your site is in your control._";
const previewCaveatText = "\n\nPlease note: this is only a demo, how you display notifications on your site is in your control.";

export function renderMarkdown(markdownText, useCaveat) {
  const finalMarkdown = markdownText + (useCaveat? previewCaveatMd : '');
  const rawMarkup = marked(finalMarkdown);
  return { __html: DOMPurify.sanitize(rawMarkup) };
}

export function addPreviewCaveatToString(rawString) {
  return (rawString + previewCaveatText);
}
