// REVIEW: Consider renaming "map" to a more descriptive name (e.g., "intervalMap") for clarity.
const map = new Map<number, number>();

// REVIEW: Global counter variable; be cautious as it can cause closure issues.
let waitingIntervalId = 0;

/**
 * REVIEW: Function name "getLastUntilOneLeft" is not descriptive.
 * REVIEW: This function mutates the input array and does not handle an empty array.
 */
function getLastUntilOneLeft(arr: number[]): number {
    if (arr.length > 1) {
        const item = arr.pop();

        // REVIEW: Type check is redundant because "arr" is already an array of numbers.
        if (typeof item !== 'number') {
            throw new Error('Invalid item type');
        }

        return item;
    }

    // REVIEW: If arr is empty, accessing arr[0] returns undefined.
    return arr[0];
}

/**
 * REVIEW: "handler" parameter is typed as Function. Use a more specific function type.
 * REVIEW: The internalHandler passes "argsInternal" as an array instead of spreading the arguments.
 * REVIEW: Using the global waitingIntervalId in the closure may lead to issues with multiple intervals.
 */
export function setWaitingInterval(handler: Function, timeouts: number[], ...args: any[]): number {
    waitingIntervalId += 1;

    function internalHandler(...argsInternal: any[]): void {
        // REVIEW: This passes the entire array as a single argument.
        handler(argsInternal);
        map.set(
            waitingIntervalId, // REVIEW: Using the global waitingIntervalId here might not be safe.
            window.setTimeout(internalHandler, getLastUntilOneLeft(timeouts), ...args)
        );
    }

    map.set(
        waitingIntervalId,
        window.setTimeout(internalHandler, getLastUntilOneLeft(timeouts), ...args)
    );

    return waitingIntervalId;
}

export function clearWaitingInterval(intervalId: number): void {
    const realTimeoutId = map.get(intervalId);

    if (typeof realTimeoutId === 'number') {
        clearTimeout(realTimeoutId);
    }
}
