
import { Subject } from 'rxjs';

export interface IWatcherInfo {
    target: any;
    prop: string | number;
    oldValue?: any;
    newValue?: any;
};

export interface IWatcherInfo {
    target: any;
    prop: string | number;
    oldValue?: any;
    newValue?: any;
};

export class ObjectWatcher<T> {

    private valueSubject: Subject<IWatcherInfo>;
    private propSubject: Subject<IWatcherInfo>;
    private proxyObject: T;
    private isBrowser = false;
    protected handler: any = null;
    constructor(object: T) {

        this.isBrowser= typeof window !== 'undefined' && typeof window.document !== 'undefined';
        this.valueSubject = new Subject<IWatcherInfo>();
        this.propSubject = new Subject<IWatcherInfo>();

        this.onWatchValue = (a ,b ,c) => {};
        const self = this;
        const handler = {
            set(target: any, prop: string | number, val: any): boolean {

                if (target instanceof Array) {
                    prop = Number(prop);
                }

                if(!target.hasOwnProperty(prop)) {
                    self.changeProp(target, prop);
                    return true;
                }

                if(target[prop] !== val) {
                    self.changeValue(target, prop, target[prop], val);
                    target[prop] = val;
                    
                    return true;
                }
                return true;
            }
        };
        this.proxyObject = new Proxy(object, handler);
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

    private changeValue(target: any, prop: string | number, old: any, nval: any): boolean {
        
        const data: IWatcherInfo = {
            target: target,
            prop: prop,
            oldValue: old,
            newValue: nval
        };
        this.valueSubject.next(data);
        if(this.isBrowser) {
            this.dispatchChangeWindowsMessage('changeObjectValues', data);
        }
        return true;
    }
    private changeProp(target: any, prop: string | number): boolean {
        const data: IWatcherInfo = {
            target: target,
            prop: prop,
        }
        this.propSubject.next(data);
        if(this.isBrowser) {
            this.dispatchChangeWindowsMessage('changeObjectProps', data);
        }
        return true;
    }
    private dispatchChangeWindowsMessage(type: string, data: IWatcherInfo): boolean {
        if(window) {
            const event = new CustomEvent(type, {detail: data});
            window.dispatchEvent(event);
        } else {
            return false;
        }
        return true;
    }
   
    public onWatchValue: (props: string | number, oldv: any, newv: any ) => void;
    public onWatchProp: (props: string | number, oldv: any, newv: any ) => void;
}

