export default class Poller {
  private static instance: Poller;
  private intervalId: number | null = null;
  private backoffInterval = 5000; // Initial backoff interval in ms
  private maxBackoffInterval = 60000; // Max backoff interval (e.g., 60 seconds)
  private isPaused = false;
  private pollingFunction: (() => Promise<boolean>) | null = null; // Declare pollingFunction
  private executePollingFunction: (() => Promise<void>) | null = null;

  private constructor() {}

  public static getInstance(pollingFunction: () => Promise<boolean>, pollInterval:number): Poller {
    if (!Poller.instance) {
      console.log('Creating new Poller object');
      Poller.instance = new Poller();
      Poller.instance.pollingFunction = pollingFunction;
      Poller.instance.startPolling(pollInterval); // start polling immediately on creation 
    }
   return Poller.instance;
  }

  public startPolling(interval: number = 20000) {
    console.log('startPolling');

    this.executePollingFunction = async () => {
      if (!this.isPaused && this.pollingFunction) {
        try {
          await this.pollingFunction();
          this.resetBackoffInterval();
        } catch (error) {
          console.error(`Polling error: ${error}`);
          this.applyBackoff();
        }
      }
    };
    
    this.executePollingFunction();
    
    // Immediately invoke polling function, then set an interval
    this.intervalId = window.setInterval(this.executePollingFunction, interval);
  }

  public restartPolling(): void {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.isPaused = false;
    this.startPolling();
  }
  
  private resetBackoffInterval() {
    this.backoffInterval = 5000; // Reset to initial value
  }

  private applyBackoff() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = window.setTimeout(() => {
      if (this.pollingFunction !== null) {
        this.pollingFunction(); // Attempt to poll again after backoff
      }
    }, this.backoffInterval);
    // Increase backoff interval for the next attempt, capped at maxBackoffInterval
    this.backoffInterval = Math.min(this.backoffInterval * 2, this.maxBackoffInterval);
  }

  public pausePolling() {
    this.isPaused = true;
    if (this.intervalId !== null) clearInterval(this.intervalId);
  }

  public resumePolling() {
    this.isPaused = false;
    // Optionally, immediately execute polling function upon resuming
    if (this.pollingFunction) {
      this.pollingFunction();
    }
  }

  public stopPolling(): void {
    this.pausePolling();
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
