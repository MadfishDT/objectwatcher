import { ObjectWatcher } from '../src/lib';

/**
 * Object Watcher Rxjs Subject Example code
 */
let testArray = [1,2,3,5,4,8,7,9];
//Make Object Watcher
const testArrayWatcher = new ObjectWatcher(testArray);

//Getting proxy object, original object convert to proxy object
testArray = testArrayWatcher.proxy;
console.log(`original array is ${testArray}`);

testArrayWatcher.valueChangeSubject.subscribe( (data) => {
    console.log('**************************************************************');
    console.log(`array value changed`);
    console.log(`array value changed target is`, data.target);
    console.log(`array prop(index) is ${data.prop}`);
    console.log(`array old value is ${data.oldValue}`);
    console.log(`array new value is ${data.newValue}`);
    console.log('**************************************************************\n');
});

testArrayWatcher.propChangeSubject.subscribe( (data) => {
    console.log('**************************************************************');
    console.log(`array value changed`);
    console.log(`array value changed target is`, data.target);
    console.log(`array prop(index) is ${data.prop}`);
    console.log('**************************************************************\n');
});

testArrayWatcher.orderChangerSubject.subscribe( (data) => {
    console.log('**************************************************************');
    console.log(`array order changed indices are ${data} indices`);
    console.log('**************************************************************\n');
});

console.log(`sort function called`);
testArray = testArray.sort();

console.log('**************************************************************');
console.log(`changed array is ${testArray}`);
console.log('changed array type is Array right?', testArray instanceof Array);
console.log('**************************************************************\n');

testArray.push(100);
console.log(`changed array is ${testArray}`);

let testArray2 = [{name: 'aa1'},{name: 'aa2'},{name: 'aa3'},{name: 'aa4'},{name2: 'aa5'},{name: 'aa6'},{name: 'aa7'},{name8: 'aa8'}];
//Make Object Watcher
const testArrayWatcher2 = new ObjectWatcher(testArray2);
testArray2 = testArrayWatcher2.proxy;

testArrayWatcher2.valueChangeSubject.subscribe( (data) => {
    console.log('**************************************************************');
    console.log(`array value changed`);
    console.log(`array value changed target is`, data.target);
    console.log(`array prop(index) is ${data.prop}`);
    console.log(`array old value is ${data.oldValue}`);
    console.log(`array new value is ${data.newValue}`);
    console.log(`object depth value is`, data.propDepth);
    console.log(`object origin is`, data.origin);
    console.log('**************************************************************\n');
});

testArrayWatcher2.propChangeSubject.subscribe( (data) => {
    console.log('**************************************************************');
    console.log(`array value changed`);
    console.log(`array value changed target is`, data.target);
    console.log(`array prop(index) is ${data.prop}`);
    console.log('**************************************************************\n');
});

testArray2[1].name = 'wefwefwef';