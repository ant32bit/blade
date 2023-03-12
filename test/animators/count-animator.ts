import { assert, expect } from "chai";
import * as sinon from 'sinon';
import { CountAnimator } from "../../src/animators";

describe("Count Animator", () => {
    const countTests: [number, number, number, boolean, number[]][] = [
        [0, 10, 1, false, [1,2,3,4,5,6,7,8,9,0,0,0]],
        [0, 10, 1, true, [1,2,3,4,5,6,7,8,9,0,1,2,3,4,5]],
        [0, 3, 0.5, true, [0.5,1,1.5,2,2.5,0,0.5,1]],
        [0, 1, 0.3, true, [0.3,0.6,0.9,0.2,0.5,0.8,0.1,0.4,0.7,0]]
    ];
    countTests.forEach(([min, max, step, loop, expectedValues]) => {
        it(`counts numbers from ${min} to ${max} in steps of ${step}`, () => {
            const animator = new CountAnimator(min, max, step, loop);

            const firstValue = animator.value();
            expect(firstValue).to.equal(min);

            for(const expectedValue of expectedValues) {
                const next = animator.next(1);
                expect(Math.abs(next - expectedValue)).to.be.lessThan(0.00001)
                
                const value = animator.value();
                expect(Math.abs(value - expectedValue)).to.be.lessThan(0.00001)
            }
        });
    });

    const finishedTests: [number, number, number, boolean, number, boolean][] = [
        [0, 10, 1, false, 6, false],
        [0, 10, 1, false, 9, false],
        [0, 10, 1, false, 10, true],
        [0, 10, 1, false, 12, true],
        [0, 3, 1, true, 2, false],
        [0, 3, 1, true, 3, false],
        [0, 3, 1, true, 4, false],
        [0, 3, 1, true, 20, false],
    ];
    finishedTests.forEach(([min, max, step, loop, ticks, expectedValue]) => {
        it(`${expectedValue ? 'finishes' : 'doesn\'t finish'} a count from ${min} to ${max} after ${ticks} ticks`, () => {
            const animator = new CountAnimator(min, max, step, loop);
            
            expect(animator.finished()).to.be.false;

            animator.next(ticks);
            expect(animator.finished()).to.equal(expectedValue);

            animator.reset();
            expect(animator.finished()).to.be.false;

            for (let i = 0; i < ticks; i++) animator.next(1);
            expect(animator.finished()).to.equal(expectedValue);
        });
    });
});

