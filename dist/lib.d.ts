import { Subject } from 'rxjs';
export interface IWatcherInfo {
    target: any;
    prop?: string | number;
    oldValue?: any;
    newValue?: any;
}
export declare class ObjectWatcher<T> {
    private valueSubject;
    private propSubject;
    private orderSubject;
    private proxyObject;
    private isBrowser;
    private isArray;
    protected handler: any;
    constructor(object: T);
    get proxy(): T;
    get valueChangeSubject(): Subject<IWatcherInfo>;
    get propChangeSubject(): Subject<IWatcherInfo>;
    get orderChangerSubject(): Subject<Array<any>>;
    private changeValue;
    private changeProp;
    private dispatchChangeWindowsMessage;
    private checkOrderChanged;
    onWatchValue: (props: string | number, oldv: any, newv: any) => void;
    onWatchProp: (props: string | number, oldv: any, newv: any) => void;
}
