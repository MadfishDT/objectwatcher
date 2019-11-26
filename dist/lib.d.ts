import { Subject } from 'rxjs';
declare type propDepthType = Array<string | number>;
export interface IWatcherInfo {
    origin?: any;
    target: any;
    prop?: string | number;
    oldValue?: any;
    newValue?: any;
    propDepth?: propDepthType;
}
export declare class GlobalLiteralWatcher {
    private isBrowser;
    private valueSubject;
    private isStop;
    constructor();
    get valueChangeSubject(): Subject<IWatcherInfo>;
    private dispatchChangeWindowsMessage;
    stopWatch(): void;
    watch(): boolean;
}
export declare class ObjectWatcher<T> {
    private valueSubject;
    private propSubject;
    private orderSubject;
    private proxyObject;
    private isBrowser;
    private isArray;
    private parent;
    private name;
    protected handler: any;
    constructor(object: T, name?: string | number, parent?: any);
    private refreshObjectRecusive;
    get proxy(): T;
    get valueChangeSubject(): Subject<IWatcherInfo>;
    get propChangeSubject(): Subject<IWatcherInfo>;
    get orderChangerSubject(): Subject<Array<any>>;
    private changeValue;
    private changeProp;
    private dispatchChangeWindowsMessage;
    private checkOrderChanged;
}
export {};
