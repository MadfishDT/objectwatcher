
import { Subject } from 'rxjs';

export interface IWatcherInfo {
    target: any;
    name: string | number;
    oldValue?: any;
    newValue?: any;
};

class ObjectWatcher<T> {

    private valueSubject: Subject<IWatcherInfo>;
    private propSubject: Subject<IWatcherInfo>;
    private proxy: T;
    private isBrowser = false;
    constructor(object: T) {

        this.isBrowser= typeof window !== 'undefined' && typeof window.document !== 'undefined';
   
        this.onWatchValue = (a ,b ,c) => {};
        const handler = {
            set(target: any, prop: string | number, val: any): boolean {

                if(!target.hasOwnProperty(prop)) {
                    this.changeProp(prop);
                    return true;
                }

                if(target[prop] !== val) {
                    this.changeValue(target, name, target[name], val);
                    target[prop] = val;
                }
                return false;
            }
        };
        this.proxy = new Proxy(object, handler);
    }
    private changeValue(target: any, prop: string | number, old: any, nval: any): boolean {
        
        const data: IWatcherInfo = {
            target: target,
            name: prop,
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
            name: prop,
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
