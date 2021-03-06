export default class TestRunner {
    static currTestTitle: String;

    constructor() {
        TestRunner.currTestTitle = '';
    }

    static assert(expected: any, actual: any): void {
        if (expected === actual) {
            console.log('\x1b[32m', `${TestRunner.currTestTitle} is passed` ,'\x1b[0m');
        } else {
            console.log('\x1b[31m', `${TestRunner.currTestTitle} is failed with actual value: ${actual}` ,'\x1b[0m');
        }
    }

    test(title: String, testFn:()=>void): void {
        TestRunner.currTestTitle = title;
        testFn();
    }
}