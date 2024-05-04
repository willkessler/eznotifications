import { marked } from 'marked';
import DOMPurify from 'dompurify';

export enum InsertType {
  TargetInside = 'target-inside',
  TargetBefore = 'target-before',
  TargetAfter  = 'target-after',
};

export class MarkdownLib {
  public static async renderMarkdown(markdownText:string): Promise<string> {
    const rawMarkdown = await marked(markdownText);
    return DOMPurify.sanitize(rawMarkdown);
  }
}
