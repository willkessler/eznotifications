import { marked } from 'marked';
import DOMPurify from 'dompurify';

export class MarkdownLib {
  public static async renderMarkdown(markdownText:string): Promise<string> {
    const rawMarkdown = await marked(markdownText);
    return DOMPurify.sanitize(rawMarkdown);
  }
  
}
