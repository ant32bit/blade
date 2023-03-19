
export interface ILogger {
    log(level: LogLevel, message: string): void;
}

export enum LogLevel {
    trace = 1,
    debug = 2,
    info = 3,
    warn = 4,
    error = 5,
    fatal = 6
}

export class Logger implements ILogger {
    public static MaxLogs: number = 100;
    
    private _document: Document;
    private logsWindow: HTMLDivElement = null;
    private logContainer: HTMLUListElement = null;

    constructor(docRef: Document) {
        this._document = docRef;
        const logsElement = this._document.getElementById('logs');
        
        let logsContainer = logsElement.children[0] as HTMLUListElement;
        
        
        if (!logsContainer || logsContainer.id != 'logs-container') {
            logsContainer = this._document.createElement("ul") as HTMLUListElement;
            logsContainer.id = 'logs-container';
            logsElement.appendChild(logsContainer);
        }

        this.logsWindow = logsElement as HTMLDivElement;
        this.logContainer = logsContainer;
    }

    public log(level: LogLevel, message: string): void {
        if (this.logContainer.children.length == Logger.MaxLogs)
        {
            const earliest = this.logContainer.firstChild;
            this.logContainer.removeChild(earliest);
        }

        const logMessage = this._document.createTextNode(message);
        const log = this._document.createElement("li");
        log.classList.add("log");
        log.appendChild(logMessage);
        this.logContainer.appendChild(log);
        this.logsWindow.scrollTop = this.logsWindow.scrollHeight;
    }
}

export class NullLogger implements ILogger {
    public log(level: LogLevel, message: string): void {

    }
}

export class ConsoleLogger implements ILogger {
    public log(level: LogLevel, message: string): void {
        console.log(message);
    }
}