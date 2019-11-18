
import { Subject } from 'rxjs';
import { isBoolean } from 'util';

export interface IWatcherInfo {
    target: any;
    prop?: string | number;
    oldValue?: any;
    newValue?: any;
};

export class GlobalLiteralWatcher {

    private isBrowser = false;
    private valueSubject: Subject<IWatcherInfo>;
    private isStop: boolean;
    constructor() {
        this.isBrowser= typeof window !== 'undefined' && typeof window.document !== 'undefined';
        this.valueSubject = new Subject<IWatcherInfo>();
        this.isStop = false;
    }

    public get valueChangeSubject(): Subject<IWatcherInfo> {
        return this.valueSubject;
    }

    private dispatchChangeWindowsMessage(type: string, data: IWatcherInfo): boolean {
        if(this.isBrowser && window) {
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
        let timeout = 600;
        let localCopyForVars: any = {};
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
    private orderSubject: Subject<Array<any>>;
    private proxyObject: T;
    private isBrowser = false;
    private isArray = false;
    
    protected handler: any = null;
    constructor(object: T) {

        this.isBrowser= typeof window !== 'undefined' && typeof window.document !== 'undefined';
        const self = this;
      
        this.valueSubject = new Subject<IWatcherInfo>();
        this.propSubject = new Subject<IWatcherInfo>();

        const handler = {
            set: (target: any, prop: string | number, val: any): boolean => {
                if (target instanceof Array) {
                    if(prop !== 'length') {
                        prop = Number(prop);
                    }
                }

                if(!target.hasOwnProperty(prop)) {
                    this.changeProp(target, prop);
                    target[prop] = val;
                    return true;
                }
                
                if(target[prop] !== val) {
                    this.changeValue(target, prop, target[prop], val);
                    target[prop] = val;
                    return true;
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

    }
 
    public get proxy(): T {
        return this.proxyObject;
    }
    
    public get valueChangeSubject(): Subject<IWatcherInfo> {
        return this.valueSubject;
    }
    
    public get propChangeSubject(): Subject<IWatcherInfo> {
        return this.propSubject;
    }

    public get orderChangerSubject(): Subject<Array<any>> {
        return this.orderSubject;
    }

    private changeValue(target: any, prop: string | number, old: any, nval: any): boolean {
        
        const data: IWatcherInfo = {
            target: target,
            prop: prop,
            oldValue: old,
            newValue: nval
        };
        this.valueSubject.next(data);
        this.dispatchChangeWindowsMessage('changeObjectValues', data);
        return true;
    }

    private changeProp(target: any, prop: string | number): boolean {
        const data: IWatcherInfo = {
            target: target,
            prop: prop,
        }
        this.propSubject.next(data);
        this.dispatchChangeWindowsMessage('changeObjectProps', data);
        return true;
    }

    private dispatchChangeWindowsMessage(type: string, data: IWatcherInfo): boolean {
        if(this.isBrowser && window) {
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
