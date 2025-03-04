// FIX: Renamed "map" to "intervalMap" for better clarity.
// This map stores the relationship between our custom interval IDs and the real timeout IDs.
const intervalMap = new Map<number, number>();

// Global counter for unique interval IDs.
let waitingIntervalId = 0;

/**
 * Returns the next timeout value from the provided array.
 * NOTE: This function mutates the array by removing elements.
 *
 * FIX: Renamed the function to "getNextTimeout" for clarity.
 * FIX: Added a check to ensure the array is not empty.
 *
 * @param arr - Array of timeout delays.
 * @returns The next timeout delay.
 * @throws Error if the timeouts array is empty.
 */
function getNextTimeout(arr: number[]): number {
    // FIX: Check for an empty array to prevent undefined returns.
    if (arr.length === 0) {
        throw new Error('Timeouts array cannot be empty');
    }
    if (arr.length > 1) {
        return arr.pop() as number; // Safe type assertion since arr is number[].
    }
    return arr[0];
}

/**
 * Schedules the provided handler to be executed with increasing delays.
 * This function mimics setInterval with a delay pattern determined by the timeouts array.
 *
 * FIX: The "handler" parameter now uses a strict function type.
 * FIX: Captures the current interval ID locally to avoid closure issues.
 * FIX: Uses the spread operator to pass the handler's arguments correctly.
 *
 * @param handler - Callback function to execute.
 * @param timeouts - Array of timeout delays.
 * @param args - Additional arguments to pass to the handler.
 * @returns A unique interval ID.
 */
export function setWaitingInterval(
    handler: (...args: any[]) => void,
    timeouts: number[],
    ...args: any[]
): number {
    waitingIntervalId += 1;
    // FIX: Capture the current ID in a local variable.
    const currentId = waitingIntervalId;

    function internalHandler(...internalArgs: any[]): void {
        // FIX: Use spread operator so that arguments are passed individually.
        handler(...internalArgs);
        // FIX: Get the next timeout value using the updated function.
        const nextTimeout = getNextTimeout(timeouts);
        intervalMap.set(
            currentId,
            window.setTimeout(internalHandler, nextTimeout, ...args)
        );
    }

    // FIX: Schedule the initial execution with the first timeout value.
    const initialTimeout = getNextTimeout(timeouts);
    intervalMap.set(
        currentId,
        window.setTimeout(internalHandler, initialTimeout, ...args)
    );

    return currentId;
}

/**
 * Clears the scheduled waiting interval associated with the provided interval ID.
 *
 * FIX: Removes the entry from the map after clearing the timeout.
 *
 * @param intervalId - The unique interval ID returned from setWaitingInterval.
 */
export function clearWaitingInterval(intervalId: number): void {
    const timeoutId = intervalMap.get(intervalId);
    if (typeof timeoutId === 'number') {
        clearTimeout(timeoutId);
        // FIX: Clean up the intervalMap by deleting the cleared interval.
        intervalMap.delete(intervalId);
    }
}
