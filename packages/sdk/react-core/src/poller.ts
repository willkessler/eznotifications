export default class Poller {
  private static instance: Poller;
  private intervalId: number | null = null;
  private backoffInterval = 5000; // Initial backoff interval in ms
  private maxBackoffInterval = 60000; // Max backoff interval (e.g., 60 seconds)
  private pollingFunction: (() => Promise<void>) | null = null; // Declare pollingFunction
  private executePollingFunction: (() => Promise<void>) | null = null;
  private handlePollingError: (error: any) => void = () => {}; // Default to a no-op function
  private initialPollInterval:number = 3000;
  private pollInterval:number = 3000;
  private initialBackoffInterval:number = 3000;
  
  private constructor() {}

  public static getInstance(pollingFunction: () => Promise<void>, pollInterval:number,  errorHandler: (error: any) => void): Poller {
    if (!Poller.instance) {
      console.log('Creating new Poller object');
      Poller.instance = new Poller();
      Poller.instance.pollingFunction = pollingFunction;
      Poller.instance.handlePollingError = errorHandler;
      Poller.instance.initialPollInterval = pollInterval;
      Poller.instance.pollInterval = pollInterval;
      Poller.instance.startPolling(); // start polling immediately on creation 
    }
   return Poller.instance;
  }

  public startPolling() {
    console.log('startPolling');

    this.executePollingFunction = async () => {
      if (this.pollingFunction) {
        try {
          await this.pollingFunction();
          this.resetBackoffInterval();
          this.handlePollingError(null);
        } catch (error) {
          console.error(`TINAD Polling error: ${error}`);
          this.handlePollingError(error as string);
          this.applyBackoff();
        }
      }
    };
    
    this.executePollingFunction();
    
    // Immediately invoke polling function, then set an interval
    this.intervalId = window.setInterval(this.executePollingFunction, this.pollInterval);
  }

  public pausePolling() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  }

  public restartPolling(): void { // immediately restart of polling
    console.log('polling restarting.');
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.startPolling();
  }
  
  private resetBackoffInterval() {
    this.backoffInterval = this.initialBackoffInterval; // Reset to initial value
  }

  private applyBackoff() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = window.setTimeout(() => {
      if (this.pollingFunction !== null) {
        this.restartPolling(); // Attempt to start up again again after backoff
      }
    }, this.backoffInterval);
    // Increase backoff interval for the next attempt, capped at maxBackoffInterval
    this.backoffInterval = Math.min(this.backoffInterval * 2, this.maxBackoffInterval);
    console.log(`Poller backing off to ${this.backoffInterval}`);
  }

  public resumePolling() {
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
