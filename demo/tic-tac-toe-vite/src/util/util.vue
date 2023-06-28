<script>
export function* range(end, start = 0) {
    if (start > end) {
        [start, end] = [end, start]
    }
    for (let i = start; i < end; ++i) {
        yield i
    }
}
export const binRead = (dec, binIndex) => dec >> binIndex
export const binWrite = (dec, binIndex) => dec + 1 << binIndex
export const binInverse = (dec, binIndex) => dec ^ 1 << binIndex
export const not = bool => !bool
export const charMask = (str, maskChar) => +("0b" + [...str].map(curChar => curChar === "" + maskChar ? "1" : "0").join(""))
</script>