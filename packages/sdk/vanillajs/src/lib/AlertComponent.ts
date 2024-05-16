//
// Create a shadown dom element for alerts to hide their CSS from any site css e.g. tailwind
// This was an attempt to isolate markdown styles from tailwind css or other site mods. It didn't
// work (I switched to what's MarkdownLib:protectMdStyles() but keeping for posterity in case I need
// some shadowdom stuff later.
//
export class AlertComponent extends HTMLElement {

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        h2 {
          font-size: 2em;
          margin-bottom: 0.5em;
        }
        p {
          margin: 0;
        }
      </style>
      <div id="tinad-alert-container"></div>
    `;
  }

  public static createAlertContainer():HTMLElement {
    const alertComponent = document.createElement('tinad-alert-component');
    document.body.appendChild(alertComponent);
    return alertComponent.shadowRoot.getElementById('tinad-alert-container');
  }

}

customElements.define('tinad-alert-component', AlertComponent);

