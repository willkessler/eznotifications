import { marked } from 'marked';
import DOMPurify from 'dompurify';

export class MarkdownLib {
  public static async renderMarkdown(markdownText:string): Promise<string> {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    const rawMarkdown = await marked(markdownText);
    return DOMPurify.sanitize(rawMarkdown);
  }

  public static protectMdStyles(renderedMarkdown:string): string {
    const customStyles = `
    <style>
    .swal2-html-container h1 {
      font-size: 2em;
      margin: 0.67em 0;
    }
    .swal2-html-container h2 {
      font-size: 1.5em;
      margin: 0.75em 0;
    }
    .swal2-html-container h3 {
      font-size: 1.17em;
      margin: 0.83em 0;
    }
    .swal2-html-container h4 {
      font-size: 1em;
      margin: 1.12em 0;
    }
    .swal2-html-container p {
      margin: 1em 0;
    }
    .swal2-html-container blockquote {
      margin: 1em 0;
      padding: 0 1em;
      border-left: 0.25em solid #dfe2e5;
      color: #6a737d;
    }
    .swal2-html-container code {
      font-family: monospace;
      font-size: 1em;
      background-color: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    .swal2-html-container pre {
      font-family: monospace;
      font-size: 1em;
      background-color: #f6f8fa;
      padding: 1em;
      overflow: auto;
      border-radius: 3px;
    }
    .swal2-html-container ul, .swal2-html-container ol {
      margin: 1em 0;
      padding-left: 40px;
    }
    .swal2-html-container li {
      margin: 0.5em 0;
    }
    .swal2-html-container table {
      border-collapse: collapse;
      width: 100%;
    }
    .swal2-html-container th, .swal2-html-container td {
      border: 1px solid #dfe2e5;
      padding: 0.6em 1em;
    }
    .swal2-html-container th {
      background-color: #f6f8fa;
      font-weight: bold;
    }
  </style>
    `;
      const protectedContent = `
      ${customStyles}
      <div class="swal2-html-container">${renderedMarkdown}</div>
      `;
    return protectedContent;
  }
  
}
