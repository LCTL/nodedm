export interface Machine {
    name: string;
    active: boolean;
    driver: string;
    state: MachineStatus;
    url: string;
    swarm: string;
}
export interface EnvConfig {
    swarm?: boolean;
    shell?: string;
    unset?: boolean;
}
export interface Entry<R> {
    name: string;
    value: R;
}
export interface Map<R> {
    [name: string]: R;
}
export declare class Driver {
    name: string;
    options: Map<string>;
    constructor(name: string, options?: Map<string>);
    toCommandOptions(): string[];
}
export declare class Swarm {
    master: boolean;
    discovery: string;
    strategy: string;
    host: string;
    addr: string;
    opts: string[];
    toCommandOptions(): string[];
    protected _push(options: string[], name: string, value: string, emptyCallback?: (name: string) => void): void;
}
export declare class MachineStatus {
    private value;
    static STOPPED: MachineStatus;
    static RUNNING: MachineStatus;
    static TIMEOUT: MachineStatus;
    static ERROR: MachineStatus;
    static NOT_EXIST: MachineStatus;
    static ALL: MachineStatus[];
    static valueOf(state: string): MachineStatus;
    constructor(value: string);
}
export declare class DockerMachine {
    ls(): Promise<Machine[]>;
    create(names: string | string[], driver: Driver, swarm?: Swarm): Promise<boolean | Map<boolean>>;
    inspect(names: string | string[]): Promise<any | Map<any>>;
    inspectAll(): Promise<Map<any>>;
    remove(names: string | string[]): Promise<boolean | Map<boolean>>;
    removeAll(): Promise<Map<boolean>>;
    start(names: string | string[]): Promise<boolean | Map<boolean>>;
    startAll(): Promise<Map<boolean>>;
    stop(names: string | string[]): Promise<boolean | Map<boolean>>;
    stopAll(): Promise<Map<boolean>>;
    restart(names: string | string[]): Promise<boolean | Map<boolean>>;
    restartAll(): Promise<Map<boolean>>;
    kill(names: string | string[]): Promise<boolean | Map<boolean>>;
    killAll(): Promise<Map<boolean>>;
    status(names: string | string[]): Promise<MachineStatus | Map<MachineStatus>>;
    statusAll(): Promise<Map<MachineStatus>>;
    ip(names: string | string[]): Promise<string | Map<string>>;
    ipAll(): Promise<Map<string>>;
    url(names: string | string[]): Promise<string | Map<string>>;
    urlAll(): Promise<Map<string>>;
    upgrade(names: string | string[]): Promise<boolean | Map<boolean>>;
    upgradeAll(): Promise<Map<boolean>>;
    regenerateCert(names: string | string[]): Promise<boolean | Map<boolean>>;
    regenerateAllCert(): Promise<Map<boolean>>;
    ssh(names: string | string[], cmd: string): Promise<string | Map<string>>;
    scp(from: string, to: string, recursive: boolean): Promise<string>;
    active(): Promise<string>;
    config(names: string | string[]): Promise<string | Map<string>>;
    env(names: string | string[], config?: EnvConfig): Promise<string | Map<string>>;
    protected _namesExec<R>(names: string | string[], fn: (name: string) => Promise<R>): Promise<R | Map<R>>;
    protected _listExec<R>(fn: (nameLstring) => Promise<R>): Promise<Map<R>>;
    protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<Map<R>>;
    protected _bexec(command: string[]): Promise<boolean>;
    protected _exec(command: string[]): Promise<string>;
}
export declare var dm: DockerMachine;
