export const MAX_RANDOM_COUNT = 1000;
export const MAX_RANDOM_RANGE = 2 ** 32;

export interface RandomNumberRequest { min: number; max: number; count: number; allowDuplicates: boolean; }

export function parseRandomNumberRequest(minText: string, maxText: string, countText: string, allowDuplicates: boolean): { request: RandomNumberRequest; error?: never } | { error: string; request?: never } {
  if (![minText, maxText, countText].every(text => text.trim())) return { error: "Enter a minimum, maximum and count." };
  const min = Number(minText), max = Number(maxText), count = Number(countText);
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) return { error: "Minimum and maximum must be whole numbers within the safe integer range." };
  if (min > max) return { error: "Minimum must be less than or equal to maximum." };
  const range = max - min + 1;
  if (!Number.isSafeInteger(range) || range > MAX_RANDOM_RANGE) return { error: "Choose a range containing at most 4,294,967,296 values." };
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_RANDOM_COUNT) return { error: "Count must be a whole number from 1 to 1,000." };
  if (!allowDuplicates && count > range) return { error: `This range contains only ${range} distinct ${range === 1 ? "number" : "numbers"}. Reduce the count or allow duplicates.` };
  return { request: { min, max, count, allowDuplicates } };
}

function drawSecureUint32(): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0];
}

/** Rejection sampling avoids modulo bias; the inclusive range is limited to 2^32. */
function randomOffset(range: number, drawUint32: () => number): number {
  const limit = Math.floor(MAX_RANDOM_RANGE / range) * range;
  let sample: number;
  do {
    sample = drawUint32();
    if (!Number.isInteger(sample) || sample < 0 || sample >= MAX_RANDOM_RANGE) throw new Error("Secure random generation returned an invalid value.");
  } while (sample >= limit);
  return sample % range;
}

export function generateRandomNumbers(request: RandomNumberRequest, drawUint32: () => number = drawSecureUint32): number[] {
  const validation = parseRandomNumberRequest(String(request.min), String(request.max), String(request.count), request.allowDuplicates);
  if (validation.error !== undefined) throw new Error(validation.error);
  const range = request.max - request.min + 1;
  const numbers: number[] = [];
  // A virtual partial shuffle uses O(count) memory even for a range of 2^32 values.
  const remapped = new Map<number, number>();
  for (let index = 0; index < request.count; index++) {
    const remaining = request.allowDuplicates ? range : range - index;
    const offset = randomOffset(remaining, drawUint32);
    if (request.allowDuplicates) numbers.push(request.min + offset);
    else {
      const selected = remapped.get(offset) ?? offset;
      const tail = remaining - 1;
      remapped.set(offset, remapped.get(tail) ?? tail);
      remapped.delete(tail);
      numbers.push(request.min + selected);
    }
  }
  return numbers;
}

/** Keep sums and the mean rounded to two decimals accurate near safe-integer bounds. */
export function randomNumberTotals(numbers: readonly number[]) {
  if (!numbers.length) return { sum: "0", average: "0" };
  const sum = numbers.reduce((total, value) => total + BigInt(value), 0n);
  const count = BigInt(numbers.length);
  const absoluteSum = sum < 0n ? -sum : sum;
  const hundredths = (absoluteSum * 100n + count / 2n) / count;
  const decimal = String(hundredths % 100n).padStart(2, "0");
  const average = `${sum < 0n && hundredths !== 0n ? "-" : ""}${hundredths / 100n}.${decimal}`.replace(/\.?0+$/, "");
  return { sum: sum.toString(), average };
}
