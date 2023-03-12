import { IAnimator } from "./animator";

export class CountAnimator implements IAnimator<number> {

    private range: number;
    private ticks: number;
    private curr: number;
    private ended: boolean;

    constructor(private min: number, max: number, private step: number, private loop: boolean = false) {
        this.range = max - min;
        this.reset();
    }

    public next(nTicks: number): number {
        if (this.ended)
            return this.value();
        
        this.ticks += nTicks;
        this.curr = (this.ticks * this.step);
        if (this.curr >= this.range) {
            if (this.loop) {
                let overflow = this.range;
                while(overflow <= this.curr) overflow += this.range;
                overflow -= this.range;
                this.curr -= overflow;
            } else {
                this.curr = 0;
                this.ended = true;
            }
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
        this.ticks = 0;
        this.ended = false;
    } 
}