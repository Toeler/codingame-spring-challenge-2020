export function wrap(num: number, maxExclusive: number) {
    return (num%maxExclusive + maxExclusive)%maxExclusive;
}
