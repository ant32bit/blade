export interface IAnimator<T> {
    next(elapsedMs: number): T;
    value(): T;
    finished(): boolean;
    reset(): void;
}