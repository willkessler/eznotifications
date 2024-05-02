import { marked } from 'marked';
import DOMPurify from 'dompurify';

export class MarkdownLib {
  public static async renderMarkdown(markdownText:string): Promise<string> {
    const rawMarkdown = await marked(markdownText);
    return DOMPurify.sanitize(rawMarkdown);
  }

  public static async insertMarkdownInDOM(markdownText:string, parentElement:HTMLElement, elementType: string,  className: string): Promise<void> {
    const contentElement = document.createElement(elementType);
    contentElement.innerHTML = await MarkdownLib.renderMarkdown(markdownText);

    contentElement.className = className;
    parentElement.appendChild(contentElement); 

    return Promise.resolve();
  }

}
