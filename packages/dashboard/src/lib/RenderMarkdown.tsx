import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const renderMarkdown = (markdownText:string): { __html: string  } => {
    const rawMarkup = marked(markdownText) + '';
    const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
    return { __html: sanitizedMarkup };
}
