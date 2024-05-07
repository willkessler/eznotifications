import '../css/overlay.css';

export class Poller {
  private static instance: Poller | null = null;
  private intervalId: number | null = null;
  private pausePollingDelayTimeout: number | null = null;
  private backoffInterval: number = 5000; // Initial backoff interval
  private maxBackoffInterval: number = 60000; // Max backoff interval
  private pollingFunction: (() => Promise<number>) | null = null; // Function to call for polling
  private executePollingFunction: (() => Promise<void>) | null = null; // Wrapper for executing polling function
  private handlePollingError: (error: any) => void = () => {}; // Default no-op function
  private initialPollInterval: number = 5000; // Initial poll interval
  private pollingInterval: number = 5000; // Current poll interval
  private updatedPollingInterval: number | null = null; // Holds updated interval
  private initialBackoffInterval: number = 3000; // Initial backoff interval
  private pollingPaused: boolean = false; // Flag for polling state
  private POLLING_PAUSE_DELAY = 5000;
  // If polling is paused with a passed ID, then it cannot be unpaused except by providing the same ID. Prevents race conditions
  private pausePollingId:number = null; 

  private constructor() {}

  public static getInstance(
    pollingFunction: () => Promise<number>,
    initialPollInterval: number,
    errorHandler: (error: any) => void
  ): Poller {
    if (!Poller.instance) {
      Poller.instance = new Poller();
      Poller.instance.pollingFunction = pollingFunction;
      Poller.instance.handlePollingError = errorHandler;
      Poller.instance.initialPollInterval = initialPollInterval;
      Poller.instance.pollingInterval = Poller.instance.initialPollInterval;
      Poller.instance.setupPollerMouseEvents();
      Poller.instance.startPolling();
    }
    return Poller.instance;
  }

  public startPolling() {
    this.executePollingFunction = async () => {
      if (this.pollingFunction && !this.pollingPaused) {
        try {
          const updatedPollingInterval = await this.pollingFunction();
          if (updatedPollingInterval === -1) {
            // network error caught in the fetch to the API. implement backoff.
            this.applyBackoff();
            console.log(`Poller got error back from pollingFunction. Backing off to ${this.backoffInterval}`);
          } else {            
            if (updatedPollingInterval !== null) {
              this.updatedPollingInterval = updatedPollingInterval;
            }
            this.resetBackoffInterval();
            this.handlePollingError(null);
          }
        } catch (error) {
          // some other error occurred during polling. also implement backoff policy
          console.log(`Polling error: ${error}`);
          console.log(`new polling interval: ${this.pollingInterval}, backoff: ${this.backoffInterval}`);
          this.handlePollingError(error as string);
          this.applyBackoff();
        } finally {
          if (this.updatedPollingInterval !== null && this.updatedPollingInterval !== this.pollingInterval) {
            if (this.intervalId !== null) clearInterval(this.intervalId);
            this.pollingInterval = this.updatedPollingInterval;
            this.updatedPollingInterval = null;
            this.intervalId = window.setInterval(this.executePollingFunction as TimerHandler, this.pollingInterval);
          }
        }
      }
    };

    this.executePollingFunction();
    this.intervalId = window.setInterval(this.executePollingFunction, this.pollingInterval);
  }

  public pausePolling(pauseId?: number) {
    if (this.pausePollingId !== null || this.pollingPaused) {
      return; // cannot pause because somebody paused already or paused with an ID
    }
    this.pollingPaused = true;
    if (pauseId !== null) {
      this.pausePollingId = pauseId;
      console.log(`Paused polling with pausePollingId: ${pauseId}`);
    } else {
      console.log('Paused polling, no Id');
    }
  }

  public pausePollingDelayed(pollingPauseDelay: number) {
    this.pausePollingDelayTimeout = window.setTimeout(() => {
      this.pausePolling(null);
    }, pollingPauseDelay);
  }

  public resumePolling(pauseId?: number) {
    if (this.pausePollingId !== null) {
      if (pauseId !== this.pausePollingId) {
        console.log('Not resuming since no pausePollingId match.');
        return;
      }
    }
        
    if (this.pausePollingDelayTimeout !== null) {
      clearTimeout(this.pausePollingDelayTimeout);
      this.pausePollingDelayTimeout = null;
    }
    this.pollingPaused = false;
    this.pausePollingId = null;
    console.log('resume polling');
  }

  public restartPolling(): void {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.pollingPaused = false;
    this.startPolling();
  }

  private resetBackoffInterval() {
    this.backoffInterval = this.initialBackoffInterval; // Reset to initial value
  }

  private applyBackoff() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = window.setTimeout(() => {
      if (this.pollingFunction !== null) {
        this.restartPolling();
      }
    }, this.backoffInterval);

    this.backoffInterval = Math.min(this.backoffInterval * 2, this.maxBackoffInterval);
  }

  private setupPollerMouseEvents():void {

    document.addEventListener("visibilitychange", () => {
      document.visibilityState === 'visible' ? this.restartPolling() : this.pausePolling();
    });

    const overlay = document.createElement('div');
    if (overlay) {
      overlay.className = 'tinad-overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('mouseenter', () => { console.log('mouseenter'); this.resumePolling() }, true); // Capture phase
      overlay.addEventListener('focus', () => { console.log('focus'); this.resumePolling() }, true); // Capture phase
      overlay.addEventListener('mouseleave', () => { this.pausePollingDelayed(this.POLLING_PAUSE_DELAY) }, true); // Capture phase
      overlay.addEventListener('focus', () => { this.pausePollingDelayed(this.POLLING_PAUSE_DELAY) }, true); // Capture phase
    }
  }
  
}
