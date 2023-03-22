import { IElementProvider } from "../models";

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
    private static LevelClass: string[] = ["level-undefined", "level-trace", "level-debug", "level-info", "level-warn", "level-error", "level-fatal"];
    
    private logWindow: HTMLDivElement = null;
    private logContainer: HTMLUListElement = null;

    constructor(private elementProvider: IElementProvider) {
        const logsElement = this.elementProvider.getElementById('logs');
        
        let logContainer = logsElement.children[0] as HTMLUListElement;
        
        
        if (!logContainer || logContainer.id != 'logs-container') {
            logContainer = this.elementProvider.createElement("ul") as HTMLUListElement;
            logContainer.id = 'logs-container';
            logsElement.appendChild(logContainer);
        }

        this.logWindow = logsElement as HTMLDivElement;
        this.logContainer = logContainer;
    }

    public log(level: LogLevel, message: string): void {
        if (this.logContainer.children.length == Logger.MaxLogs)
        {
            const earliest = this.logContainer.firstChild;
            this.logContainer.removeChild(earliest);
        }

        const logMessage = this.elementProvider.createTextNode(message);
        const log = this.elementProvider.createElement("li");
        log.classList.add("log", Logger.LevelClass[level]);
        log.appendChild(logMessage);
        this.logContainer.appendChild(log);
        this.logWindow.scrollTop = this.logWindow.scrollHeight;
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