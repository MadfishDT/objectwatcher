
import { Subject } from 'rxjs';
import { isBoolean } from 'util';

type propDepthType = Array<string | number>;

export interface IWatcherInfo {
    origin?: any;
    target: any;
    prop?: string | number;
    oldValue?: any;
    newValue?: any;
    propDepth?: propDepthType;
};

export class GlobalLiteralWatcher {

    private isBrowser = false;
    private valueSubject: Subject<IWatcherInfo>;
    private isStop: boolean;
    constructor() {
        try{
            if(window && typeof window !== 'undefined' && typeof window.document !== 'undefined') {
                this.isBrowser= true;
            }
        } catch(e) {
            this.isBrowser= false;
        }
        this.valueSubject = new Subject<IWatcherInfo>();
        this.isStop = false;
    }

    public get valueChangeSubject(): Subject<IWatcherInfo> {
        return this.valueSubject;
    }

    private dispatchChangeWindowsMessage(type: string, data: IWatcherInfo): boolean {
        if(this.isBrowser) {
            const event = new CustomEvent(type, {detail: data});
            window.dispatchEvent(event);
        } else {
            return false;
        }
        return true;
    }
    public stopWatch(): void {
        this.isStop = true;
    }
    public watch(): boolean {

        if (this.isStop) {
            throw Error('already watch running');
            return false;
        }

        let localCopyForVars = {};
        const originToWatch = Object.keys(window).filter( (item) => {
            try {
                return typeof window[item] === 'string' || typeof window[item] === 'number' ? true : false;
            } catch(e) {
                return false;
            }
        });
        for (let originToitems of originToWatch) {
            localCopyForVars[originToitems] = window[originToitems];
        }

        let timeout = 600;
        this.isStop = false;
        if(this.isBrowser) {
            let pollForChange = () => {
                const varsToWatch = Object.keys(window).filter( (item) => {
                    try {
                        return typeof window[item] === 'string' || typeof window[item] === 'number' ? true : false;
                    } catch(e) {
                        return false;
                    }
                })
                for (let varToWatch of varsToWatch) {
                    if (localCopyForVars[varToWatch] !== window[varToWatch]) {
                        const eventData = {
                            target: window,
                            prop: varToWatch,
                            oldValue: localCopyForVars[varToWatch],
                            newValue: window[varToWatch]
                        };
                        this.dispatchChangeWindowsMessage('onGlobalVarChange', eventData);
                        this.valueChangeSubject.next(eventData);
                        localCopyForVars[varToWatch] = window[varToWatch];
                    }
                }
                if(!this.isStop) {
                    setTimeout(pollForChange, timeout);
                }
                
            };
            if(!this.isStop) {
                setTimeout(pollForChange, timeout);
            }
            return true;
        } else {
            return false;
        }
    }
}

export class ObjectWatcher<T> {

    private valueSubject: Subject<IWatcherInfo>;
    private propSubject: Subject<IWatcherInfo>;
    private propDelSubject: Subject<IWatcherInfo>;
    private orderSubject: Subject<Array<any>>;
    private proxyObject: T;
    private isBrowser = false;
    private isArray = false;
    private parent: any;
    private name: string | number;
    
    // top parent do not need own name, but child object have name
    protected handler: any = null;
    constructor(object: T, name: string | number = null, parent: any = null) {
        try{
            if(window && typeof window !== 'undefined' && typeof window.document !== 'undefined') {
                this.isBrowser= true;
            }
        } catch(e) {
            this.isBrowser= false;
        }
        const self = this;
      
        this.valueSubject = new Subject<IWatcherInfo>();
        this.propSubject = new Subject<IWatcherInfo>();
        this.propDelSubject = new Subject<IWatcherInfo>();

        if(parent) {
            this.parent = parent;
            this.name = name;
        }
       
        const handler = {

            set: (target: any, prop: string | number, val: any): boolean => {

                if (target instanceof Array) {
                    if(prop !== 'length') {
                        prop = Number(prop);
                    }
                }

                if(!target.hasOwnProperty(prop)) {
                    if(val instanceof Object || val instanceof Array) {
                        let valTemp = new ObjectWatcher(val, prop, self);
                        val = valTemp.proxy;
                    }
                    this.changeProp(target, prop);
                    target[prop] = val;
                    return true;
                }
                
                if(target[prop] !== val) {
                    if(val instanceof Object || val instanceof Array) {
                        let valTemp = new ObjectWatcher(val, prop, self);
                        val = valTemp.proxy;
                    }
                    this.changeValue(target, prop, target[prop], val);
                    target[prop] = val;
                    return true;
                }

                return true;
            },
            deleteProperty: (target: any, prop: string | number): boolean =>{
                if (prop in target) {
                    this.deleteProp(target,prop);
                    delete target[prop];
                }
                return true;
            }
        };
        this.proxyObject = new Proxy(object, handler);

        if (object instanceof Array) {
            this.orderSubject = new Subject<Array<any>>();
            const originSort = this.proxyObject['sort'];
            Object.defineProperty(this.proxyObject,
                'sort', {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: function( compareFn?: (a: any, b: any) => number ) : any {
                        let tempOrigin = this.slice();
                        let newObject = originSort.call(this, compareFn);
                        self.checkOrderChanged(tempOrigin, newObject);
                        return newObject;
                    }
            });
        }
        this.refreshObjectRecusive(this.proxy);
    }

    private refreshObjectRecusive(obj: any): boolean {
        
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop) && obj[prop] instanceof Object) {
                let tempObj= new ObjectWatcher(obj[prop], prop, this);
                obj[prop] = tempObj.proxy;
            }
        }
        return true;
    }

    public get proxy(): T {
        return this.proxyObject;
    }
    public get valueChangeSubject(): Subject<IWatcherInfo> {
        return this.valueSubject;
    }
    public get propDeleteSubject(): Subject<IWatcherInfo> {
        return this.propDelSubject;
    }
    public get propChangeSubject(): Subject<IWatcherInfo> {
        return this.propSubject;
    }
    public get orderChangerSubject(): Subject<Array<any>> {
        return this.orderSubject;
    }

    private deleteProp(target: any, prop: string | number, propDepthList?: propDepthType): boolean {
        
        if(this.parent) {
            if(!propDepthList) {
                propDepthList = [];
            }
            propDepthList.push(this.name);
            this.parent.deleteProp(target, prop, propDepthList);
            return;
        }
        if(propDepthList) {
            propDepthList = propDepthList.reverse();
        }
        const data: IWatcherInfo = {
            origin: this.proxy,
            target: target,
            prop: prop,
            propDepth: propDepthList
        };
        this.propDeleteSubject.next(data);
        this.dispatchChangeWindowsMessage('deleteObjectProp', data);
        return true;
    }

    private changeValue(target: any, prop: string | number, old: any, nval: any, propDepthList?: propDepthType): boolean {
        
        if(this.parent) {
            if(!propDepthList) {
                propDepthList = [];
            }
            propDepthList.push(this.name);
            this.parent.changeValue(target, prop, old, nval, propDepthList);
            return;
        }
        if(propDepthList) {
            propDepthList = propDepthList.reverse();
        }
        const data: IWatcherInfo = {
            origin: this.proxy,
            target: target,
            prop: prop,
            oldValue: old,
            newValue: nval,
            propDepth: propDepthList
        };
        this.valueSubject.next(data);
        this.dispatchChangeWindowsMessage('changeObjectValues', data);
        return true;
    }

    private changeProp(target: any, prop: string | number, propDepthList?: propDepthType): boolean {
        if(this.parent) {
            if(!propDepthList) {
                propDepthList = [];
            }
            propDepthList.push(this.name);
            this.parent.changeProp(target, prop, propDepthList);
            return;
        }
        if(propDepthList) {
            propDepthList = propDepthList.reverse();
        }
        const data: IWatcherInfo = {
            target: target,
            prop: prop,
            propDepth: propDepthList
        }
        this.propSubject.next(data);
        this.dispatchChangeWindowsMessage('changeObjectProps', data);
        return true;
    }

    private dispatchChangeWindowsMessage(type: string, data: IWatcherInfo): boolean {
        if(this.isBrowser) {
            const event = new CustomEvent(type, {detail: data});
            window.dispatchEvent(event);
        } else {
            return false;
        }
        return true;
    }

    private checkOrderChanged(origin: any, target: any): boolean {

        let changeIndexArray = new Array<number>();
        let isChanged = false;
        for( let index in origin) {
            
            if(typeof origin[index] === 'object') {
                if(JSON.stringify(origin[index]) !== JSON.stringify(target[index])) {
                    isChanged = true;
                    changeIndexArray.push(Number(index));
                }
            } else {
                if(origin[index]  !== target[index]) {
                    isChanged = true;
                    changeIndexArray.push(Number(index));
                }
            }
        };
        if (isChanged) {
            this.dispatchChangeWindowsMessage('changeArrayOrder', { 
                target: this.proxyObject,
                newValue: changeIndexArray,
            });
            this.orderChangerSubject.next(changeIndexArray);
        }
        return false;
    }
   
}
