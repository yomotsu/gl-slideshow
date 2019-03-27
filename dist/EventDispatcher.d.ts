export declare type Listener = (event?: DispatcherEvent) => void;
export interface DispatcherEvent {
    type: string;
    [key: string]: any;
}
export declare class EventDispatcher {
    protected _listeners: {
        [type: string]: Listener[];
    };
    constructor();
    addEventListener(type: string, listener: Listener): void;
    hasEventListener(type: string, listener: Listener): boolean;
    removeEventListener(type: string, listener: Listener): void;
    dispatchEvent(event: DispatcherEvent): void;
}
