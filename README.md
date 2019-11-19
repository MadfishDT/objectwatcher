# objectwatchers
Object value and prop change detection module
* **Object, Array, Web Global value watcher**

**Install**
-

- npm install objectwarchers

**Support features:**
-
* browser support(UMD module)
    ``` 
    /dist/lib.bundle.umd.js
    ```
* typescript support
    ```
    lib.d.ts
    ```
* nodejs support
    ``` 
    /dist/lib.bundle.prod.js
    ```
* Watch object variable change
    * RXjs Subject Support
    * windows message Support
* Watch object Propery(Key) change(added property notify)
    * RXjs Subject Support
    * windows message Support
* Watch Array variable change
    * RXjs Subject Support
    * windows message Support
* Watch Array Sort(Order) change
    * RXjs Subject Support
    * windows message Support

**dependency:**
-
* rxjs

**APIs**
-

***ObjectWatcher***

- Object and Array Watcher module
- Use [Proxy](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- Interface 
    - IWatcherInfo
    ```typescript
    {
        target: any; 
        prop?: string | number;
        oldValue?: any;
        newValue?: any;
    }
    ```
        - target: target object
        - prop: property name or index
        - oldValue: old value of object[property]
        - oldValue: new value of object[property]
        
- Method 
    - getter
        - proxy : return new proxy object
        - valueChangeSubject : return value change subject
            - subject data: IWatcherInfo
        - propChangeSubject : return property change subject
            - subject data: IWatcherInfo
        - orderChangerSubject : return new order change subject
            - subject data: changed indices array

- Window Event(**browser only**)
    - changeObjectValues
    - changeObjectProps
    - changeArrayOrder

***GlobalLiteralWatcher***

- Global variable(literal) Watcher module
- Interface 
    - IWatcherInfo
    ```typescript
    {
        target: any; 
        prop?: string | number;
        oldValue?: any;
        newValue?: any;
    }
    ```
        - target: target object
        - prop: property name or index
        - oldValue: old value of object[property]
        - oldValue: new value of object[property]
        
- Method 
    - getter
        - proxy : return new proxy object
        - valueChangeSubject : return value change subject
            - subject data: IWatcherInfo
    - watch(): start watch variable
    - stopWatch(): stop watch variable
            
- Window Event(**browser only**)
    - onGlobalVarChange

**How to Use**
-

- **Typescript**

    - Object Value and Propery change watch
    ``` typescript
    import { ObjectWatcher } from 'objectwatchers';

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
    
    })

    /**
     * subscribe propChangeSubject
     * this occur before object property is added
     */
    testWatcher.propChangeSubject.subscribe((data) => {
    
    })

    //try change object property value
    testObject.name = 'this is name2';

    //try add object property
    testObject['name2'] = 'this is name2';

    ```


    - Array Value and Order change watch

    ``` typescript
    import { ObjectWatcher } from 'objectwatchers';

    /**
     * Object Watcher Rxjs Subject Example code
     */
    let testArray = [1,2,3,5,4,8,7,9];
    //Make Object Watcher
    const testArrayWatcher = new ObjectWatcher(testArray);

    //Getting proxy object, original object convert to proxy object
    testArray = testArrayWatcher.proxy;
    console.log(`original array is ${testArray}`);

    /**
     * subscribe valueChangeSubject
     * this occur before array property value is changed
     */
    testArrayWatcher.valueChangeSubject.subscribe( (data) => {
        
    });

    /**
     * subscribe propChangeSubject
     * this occur before array property value is changed
     */
    testArrayWatcher.propChangeSubject.subscribe( (data) => {
    
    });

    /**
     * subscribe propChangeSubject
     * this occur before array order is changed
     */
    testArrayWatcher.orderChangerSubject.subscribe( (data) => {
    
    });

    testArray = testArray.sort();
    testArray.push(100);

    ```

- **Nodejs**

    - Object Value and Propery change watch
    ``` javascript
    const ObjectWatcher = require('objectwatchers').ObjectWatcher;

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
    
    })

    /**
     * subscribe propChangeSubject
     * this occur before object property is added
     */
    testWatcher.propChangeSubject.subscribe((data) => {
    
    })

    //try change object property value
    testObject.name = 'this is name2';

    //try add object property
    testObject['name2'] = 'this is name2';

    ```


    - Array Value and Order change watch

    ``` javascript
     const ObjectWatcher = require('objectwatchers').ObjectWatcher;

    /**
     * Object Watcher Rxjs Subject Example code
     */
    let testArray = [1,2,3,5,4,8,7,9];
    //Make Object Watcher
    const testArrayWatcher = new ObjectWatcher(testArray);

    //Getting proxy object, original object convert to proxy object
    testArray = testArrayWatcher.proxy;
    console.log(`original array is ${testArray}`);

    /**
     * subscribe valueChangeSubject
     * this occur before array property value is changed
     */
    testArrayWatcher.valueChangeSubject.subscribe( (data) => {
        
    });

    /**
     * subscribe propChangeSubject
     * this occur before array property value is changed
     */
    testArrayWatcher.propChangeSubject.subscribe( (data) => {
    
    });

    /**
     * subscribe propChangeSubject
     * this occur before array order is changed
     */
    testArrayWatcher.orderChangerSubject.subscribe( (data) => {
    
    });

    testArray = testArray.sort();
    testArray.push(100);

    ```

- Global Value change watch(only for web browser)
    ``` javascript

    <head>
        <script src="../../dist/lib.bundle.umd.js"></script>
    </head>

    test = 'james.eo';
    const gWatcher = new GlobalLiteralWatcher();
        
    gWatcher.watch();

    gWatcher.valueChangeSubject.subscribe( (data) => {
    
    })

    window.addEventListener('onGlobalVarChange', (data) => {
        
    });
    
    test = 'james.eo2';

    ```
