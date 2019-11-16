import { ObjectWatcher } from '../lib';

/**
 * Object Watcher Rxjs Subject Example code
 */
let testObject = {
    name: 'this is name'
}
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