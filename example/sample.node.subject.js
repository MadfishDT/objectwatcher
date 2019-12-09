const ObjectWatcher = require('../dist/lib.bundle.prod').ObjectWatcher;

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
testWatcher.valueChangeSubject.subscribe((data) => {
    console.log('**************************************************************');
    console.log(`object value changed`);
    console.log(`object value changed target is`, data.target);
    console.log(`object prop(key) is ${data.prop}`);
    console.log(`object old value is '${data.oldValue}'`);
    console.log(`object new value is '${data.newValue}'`);
    console.log('**************************************************************\n');
})

/**
 * subscribe propChangeSubject
 * this occur before object property is added
 */
testWatcher.propChangeSubject.subscribe((data) => {
    console.log('**************************************************************');
    console.log(`object value changed target is`, data.target);
    console.log(`object prop(key) '${data.prop}' added`);
    console.log('**************************************************************\n');
})

//try change object property value
testObject.name = 'that is not name';

//try add object property
testObject['name2'] = 'I am Name2';

delete testObject.name
