import './css/overlay.css';

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
          if (updatedPollingInterval !== null) {
            this.updatedPollingInterval = updatedPollingInterval;
          }
          this.resetBackoffInterval();
          this.handlePollingError(null);
        } catch (error) {
          console.error(`Polling error: ${error}`);
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

  public pausePolling() {
    this.pollingPaused = true;
    console.log('paused polling');
  }

  public pausePollingDelayed(pollingPauseDelay: number) {
    this.pausePollingDelayTimeout = window.setTimeout(() => {
      this.pausePolling();
    }, pollingPauseDelay);
  }

  public resumePolling() {
    if (this.pausePollingDelayTimeout !== null) {
      clearTimeout(this.pausePollingDelayTimeout);
      this.pausePollingDelayTimeout = null;
    }
    this.pollingPaused = false;
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
      overlay.addEventListener('mouseenter', () => { this.resumePolling() }, true); // Capture phase
      overlay.addEventListener('focus', () => { this.resumePolling() }, true); // Capture phase
      overlay.addEventListener('mouseleave', () => { this.pausePolling() }, true); // Capture phase
      overlay.addEventListener('focus', () => { this.pausePolling() }, true); // Capture phase
    }
  }
  
}
