
export class Logger {
    public static MaxLogs: number = 100;
    
    private logContainer: HTMLUListElement = null;

    constructor() {
        const logsElement = document.getElementById('logs');
        
        let logsContainer = logsElement.children[0] as HTMLUListElement;
        
        
        if (!logsContainer || logsContainer.id != 'logs-container') {
            logsContainer = document.createElement("ul") as HTMLUListElement;
            logsContainer.id = 'logs-container';
            logsElement.appendChild(logsContainer);
        }

        this.logContainer = logsContainer;
    }

    public log(message: string): void {
        if (this.logContainer.children.length == Logger.MaxLogs)
        {
            const earliest = this.logContainer.firstChild;
            this.logContainer.removeChild(earliest);
        }

        const logMessage = document.createTextNode(message);
        const log = document.createElement("li");
        log.classList.add("log");
        log.appendChild(logMessage);
        this.logContainer.appendChild(log);
    }
}