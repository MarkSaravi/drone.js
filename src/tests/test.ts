import * as flightLogics from '../flight-logics';
class TestRunner {
    static currTestTitle: String;

    constructor() {
        TestRunner.currTestTitle = '';
    }

    static assert(expected: any, actual: any): void {
        if (expected === actual) {
            console.log(`${TestRunner.currTestTitle} is passed`);
        } else {
            console.log(`${TestRunner.currTestTitle} is failed`);
        }
    }

    test(title: String, testFn:()=>void): void {
        TestRunner.currTestTitle = title;
        testFn();
    }
}

const runner = new TestRunner();

runner.test('Hellow World', () => {
    TestRunner.assert(true, true);
});

console.log('testing...');