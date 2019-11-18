
import { Subject } from 'rxjs';

export interface IWatcherInfo {
    target: any;
    prop?: string | number;
    oldValue?: any;
    newValue?: any;
};

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
        this.onWatchValue = (a ,b ,c) => {};

        const handler = {
            set: (target: any, prop: string | number, val: any): boolean => {

                console.log('called setter');
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
                    value: function( compareFn?: (a: any, b: any) => number ) {
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
   
    public onWatchValue: (props: string | number, oldv: any, newv: any ) => void;
    public onWatchProp: (props: string | number, oldv: any, newv: any ) => void;
}
