import { IAnimator } from "./animator";

export class CountAnimator implements IAnimator<number> {

    private curr: number;
    private stepsPerMs: number;
    private runTimeMs: number;
    private ended: boolean;

    constructor(private min: number, max: number, private durationMs: number, private loop: boolean = false) {
        this.stepsPerMs = (max - min) / durationMs;
        this.reset();
    }

    public next(elpasedMs: number): number {
        if (this.ended)
            return this.value();
        
        this.runTimeMs = this.runTimeMs + elpasedMs;
        if(this.loop) {
            this.curr = (this.runTimeMs % this.durationMs) * this.stepsPerMs;
        }
        else if (this.runTimeMs >= this.durationMs) {
            this.ended = true;
            this.curr = this.durationMs * this.stepsPerMs;
        }
        else {
            this.curr = this.runTimeMs * this.stepsPerMs;
        }
            
        return this.value();
    }
    
    public value(): number {
        return this.curr + this.min;
    }
    
    public finished(): boolean {
        return this.ended;
    }
    
    public reset(): void {
        this.curr = 0;
        this.runTimeMs = 0;
        this.ended = false;
    } 
}