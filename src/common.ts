function  fixNum(n: number, len: number = 8) : string {
    let s = n.toFixed(3);
    while (s.length<len) {
        s += ' ';
    }
    return s;
}

export { fixNum };