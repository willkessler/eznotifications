export default class Poller {
  private static instance: Poller;
  private intervalId: number | null = null;
  private pausePollingDelayTimeout:number | null = null;
  private backoffInterval = 5000; // Initial backoff interval in ms
  private maxBackoffInterval = 60000; // Max backoff interval (e.g., 60 seconds)
  private pollingFunction: (() => Promise<number>) | null = null; // Declare pollingFunction
  private executePollingFunction: (() => Promise<void>) | null = null;
  private handlePollingError: (error: any) => void = () => {}; // Default to a no-op function
  private initialPollInterval:number = 5000;
  private pollingInterval:number = 5000;
  private updatedPollingInterval:number | null = null;
  private initialBackoffInterval:number = 3000;
  private pollingPaused:boolean = false;
  
  private constructor() {}

  public static getInstance(pollingFunction: () => Promise<number>, initialPollInterval:number,  errorHandler: (error: any) => void): Poller {
    if (!Poller.instance) {
      //console.log('Creating new Poller object');
      Poller.instance = new Poller();
      Poller.instance.pollingFunction = pollingFunction;
      Poller.instance.handlePollingError = errorHandler;
      Poller.instance.initialPollInterval = initialPollInterval;
      Poller.instance.pollingInterval = Poller.instance.initialPollInterval;
      Poller.instance.startPolling(); // start polling immediately on creation 
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
          console.error(`TINAD Polling error: ${error}`);
          this.handlePollingError(error as string);
          this.applyBackoff();
        } finally {
          if (this.updatedPollingInterval !== null && this.updatedPollingInterval !== this.pollingInterval) { 
            // We have an updated interval time so trigger next interval differently
            //console.log(`Updating polling time to ${this.updatedPollingInterval} (from ${this.pollingInterval}).`);
            if (this.intervalId !== null) clearInterval(this.intervalId);
            this.pollingInterval = this.updatedPollingInterval;
            this.updatedPollingInterval = null;
            this.intervalId = window.setInterval(this.executePollingFunction as unknown as TimerHandler, this.pollingInterval);
          }
        }        
      }
    };
    
    this.executePollingFunction();
    
    // Immediately invoke polling function, then set an interval
    this.intervalId = window.setInterval(this.executePollingFunction, this.pollingInterval);
  }

  public pausePolling() {
    this.pollingPaused = true;
  }

  public pausePollingDelayed(pollingPauseDelay:number) {
    this.pausePollingDelayTimeout = window.setTimeout(():void => {
      //console.log('Pausing polling after debounce timeout.');
      this.pausePolling();
    }, pollingPauseDelay);
  }
  
  public resumePolling() {
    if (this.pausePollingDelayTimeout !== null) {
      clearTimeout(this.pausePollingDelayTimeout);
      this.pausePollingDelayTimeout = null;
    }
    this.pollingPaused = false;
  }

  public restartPolling(): void { // immediately restart of polling
    //console.log('polling restarting.');
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
        this.restartPolling(); // Attempt to start up again again after backoff
      }
    }, this.backoffInterval);
    // Increase backoff interval for the next attempt, capped at maxBackoffInterval
    this.backoffInterval = Math.min(this.backoffInterval * 2, this.maxBackoffInterval);
    //console.log(`Poller backing off to ${this.backoffInterval}`);
  }

}
