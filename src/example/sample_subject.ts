import { ObjectWatcher } from '../lib';

/**
 * Object Watcher Rxjs Subject Example code
 */
let testObject = {
    name: 'this is name'
}

let testArray = [2,3,5,1,8,9,7];

console.log('original testObject is: ', testObject);

//Make Object Watcher
const testWatcher = new ObjectWatcher(testObject);
//Getting proxy object, original object convert to proxy object
testObject = testWatcher.proxy;

/**
 * subscribe valueChangeSubject
 * this occur before object property value is changed
 */
testWatcher.valueChangeSubject.subscribe((info) => {
    console.log(`test change value`, info);
})

testWatcher.valueChangeSubject.subscribe((info) => {
    console.log(`test change value2`, info);
})

/**
 * subscribe propChangeSubject
 * this occur before object property is added
 */
testWatcher.propChangeSubject.subscribe((info) => {
    console.log(`test change prop`, info);
})

//try change object property value
testObject.name = 'this is name2';

//try add object property
testObject['name2'] = 'this is name2';


//Make Object Watcher
const testArrayWatcher = new ObjectWatcher(testArray);
//Getting proxy object, original object convert to proxy object
testArray = testArrayWatcher.proxy;

testArrayWatcher.valueChangeSubject.subscribe( (data) => {
    console.log(`array value changed`, data);
});

testArray.sort();
