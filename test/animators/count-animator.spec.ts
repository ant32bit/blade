import { assert, expect } from "chai";
import * as sinon from 'sinon';
import { CountAnimator } from "../../src/animators";

describe("Count Animator", () => {
    const countTests: [number, number, number, number, boolean, number[]][] = [
        [0, 10, 1000, 100, false, [1,2,3,4,5,6,7,8,9,10,10,10]],
        [0, 10, 1000, 100, true, [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5]],
        [0, 3, 300, 50, true, [0.5,1,1.5,2,2.5,0,0.5,1]],
        [0, 1, 1000, 300, true, [0.3,0.6,0.9,0.2,0.5,0.8,0.1,0.4,0.7,0]]
    ];
    countTests.forEach(([min, max, duration, elapsed, loop, expectedValues]) => {
        it(`counts numbers from ${min} to ${max} over ${duration}ms in ${elapsed}ms steps`, () => {
            const animator = new CountAnimator(min, max, duration, loop);

            const firstValue = animator.value();
            expect(firstValue).to.equal(min);

            for(const expectedValue of expectedValues) {
                const next = animator.next(elapsed);
                expect(Math.abs(next - expectedValue)).to.be.lessThan(0.00001)
                
                const value = animator.value();
                expect(Math.abs(value - expectedValue)).to.be.lessThan(0.00001)
            }
        });
    });

    const finishedTests: [number, number, number, boolean, number, number, boolean][] = [
        [0, 10, 1000, false, 100, 6, false],
        [0, 10, 1000, false, 100, 9, false],
        [0, 10, 1000, false, 100, 10, true],
        [0, 10, 1000, false, 100, 12, true],
        [0, 3, 150, true, 50, 2, false],
        [0, 3, 150, true, 50, 3, false],
        [0, 3, 150, true, 50, 4, false],
        [0, 3, 150, true, 50, 20, false],
    ];
    finishedTests.forEach(([min, max, duration, loop, elapsed, ticks, expectedValue]) => {
        it(`${expectedValue ? 'finishes' : 'doesn\'t finish'} a count from ${min} to ${max} for ${duration} ms after ${ticks} ${duration}ms ticks`, () => {
            const animator = new CountAnimator(min, max, duration, loop);
            
            expect(animator.finished()).to.be.false;

            animator.next(ticks * elapsed);
            expect(animator.finished()).to.equal(expectedValue);

            animator.reset();
            expect(animator.finished()).to.be.false;

            for (let i = 0; i < ticks; i++) animator.next(elapsed);
            expect(animator.finished()).to.equal(expectedValue);
        });
    });
});

