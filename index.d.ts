export interface Signal<T = any> {
  /**
   * Custom event broadcaster
   * <br />- inspired by Robert Penner's AS3 Signals.
   * @author Miller Medeiros
   */
  new (): Signal<T>;

  add(
    listener: (...params: T[]) => void,
    listenerContext?: any,
    priority?: Number
  ): void;

  /**
   * Add listener to the signal that should be removed after first execution (will be executed only once).
   *
   * @param listener Signal handler function.
   * @param listenercontext Context on which listener will be executed (object that should represent the `this` variable inside listener function).
   * @param priority The priority level of the event listener.
   *                 Listeners with higher priority will be executed before listeners with lower priority.
   *                 Listeners with same priority level will be executed at the same order as they were added. (default = 0)
   */
  addOnce(
    listener: (...params: T[]) => void,
    listenerContext?: any,
    priority?: Number
  ): void;

  /**
   * Dispatch/Broadcast Signal to all listeners added to the queue.
   *
   * @param params Parameters that should be passed to each handler.
   */
  dispatch(...params: T[]): void;

  /**
   * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
   */
  dispose(): void;

  /**
   * Remove a single listener from the dispatch queue.
   */
  remove(listener: (...params: T[]) => void, context?: any): void;

  removeAll(): void;
}

export declare class MangaCore {
  onClear: Signal;
  middleware: any;
  getInfo(): any;
  clear(): void;
  get(path: string): Promise<any>;
  validate(path: string): Promise<any>;
  delete(path: string): Promise<{ success: boolean; message: string }>;
  set(
    path: string,
    value: any,
    validate?: boolean,
    dispatchEvent?: boolean
  ): Promise<any>;
  setTemporary(
    path: string,
    value: any,
    timeoutSeconds?: number,
    validate?: boolean,
    dispatchEvent?: boolean
  ): Promise<any>;
  reset(
    path: string,
    value: any,
    validate?: boolean,
    dispatchEvent?: boolean
  ): Promise<any>;
  resetTemporary(
    path: string,
    value: any,
    timeoutSeconds?: number,
    validate?: boolean,
    dispatchEvent?: boolean
  ): Promise<any>;
  message(
    path: string,
    value: any,
    save?: boolean,
    reset?: boolean
  ): Promise<any>;
  setValidateFN(fn: (path: string, data: any) => boolean | string): void;
  addMessageListener(
    ob: ListenerHandlerInfo,
    listenerClient: { id: string }
  ): void;
  addListener(
    ob: ListenerHandlerInfo,
    listenerClient: any,
    isMessage?: boolean
  ): void;
  removeMessageListener(
    ob: ListenerHandlerInfo,
    listenerIoClient: { id: string }
  ): void;
  removeListener(
    ob: ListenerHandlerInfo,
    listenerClient: any,
    isMessage?: boolean
  ): void;
  removeAllListener(listenerIoClient: { id: string }): void;
  //create method declare to subscribe
  subscribe(
    path: string,
    //receive function with 2 parameters
    callback: (data: any, path: string) => void,
    updateMode?: string,
    isMessage?: boolean
  ): { id: string };
  unsubscribe(id: string): void;
  //this.subscribe = (path, callback, updateMode = "onChange", isMessage = false) => {
}

export declare class ListenerClient {
  id: number;
  callback: Map<string, Function>;
  registerListener(eventName: string, callback: Function): void;
  getListenerInfo(path: string, mode: string, callback: Function): ListenerInfo;
  emit(eventName: string, value: any, callback: Function): void;
}

export interface ListenerHandlerInfo {
  listener: {
    property: string;
    updateMode: "onChange" | "onSet" | "onInterval" | "onChangeLength";
    frequency: number;
  };
  handler: {
    method: string;
    filter: {
      mode: "full" | "changed";
      data: string;
    };
  };
}

export interface ListenerInfo {
  listener: {
    path: string;
    property: string;
    updateMode: string;
  };
  handler: {
    method: string;
  };
  repeatedListeners: number;
  clientName: string;
}
