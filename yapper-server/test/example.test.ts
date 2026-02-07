import {describe, test, expect, vi} from 'vitest';


describe('Example Test Suite', () => {

    test('Basic example test', () => {

        expect(1+1).toBe(2);
    })


})


describe("Mock function practice", () =>{
    test("mock function example", ()=>{
        const mockFn = vi.fn();
        mockFn(10,20);
        mockFn(20);
        mockFn(30);
        console.log(mockFn.mock.calls);
    })
})