export interface Machine {
    name: string;
    active: boolean;
    driver: string;
    state: MachineStatus;
    url: string;
    swarm: string;
}
export declare class Driver {
    name: string;
    options: {
        [key: string]: string;
    };
    constructor(name: string, options?: {
        [key: string]: string;
    });
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
    list(): Promise<Machine[]>;
    create(names: string | string[], driver: Driver, swarm?: Swarm): Promise<boolean | boolean[]>;
    inspect(names: string | string[]): Promise<any | any[]>;
    inspectAll(): Promise<any[]>;
    remove(names: string | string[]): Promise<boolean | boolean[]>;
    removeAll(): Promise<boolean[]>;
    start(names: string | string[]): Promise<boolean | boolean[]>;
    startAll(): Promise<boolean[]>;
    stop(names: string | string[]): Promise<boolean | boolean[]>;
    stopAll(): Promise<boolean[]>;
    restart(names: string | string[]): Promise<boolean | boolean[]>;
    restartAll(): Promise<boolean[]>;
    kill(names: string | string[]): Promise<boolean | boolean[]>;
    killAll(): Promise<boolean[]>;
    status(names: string | string[]): Promise<MachineStatus | MachineStatus[]>;
    statusAll(): Promise<MachineStatus[]>;
    ip(names: string | string[]): Promise<string | string[]>;
    ipAll(): Promise<string[]>;
    url(names: string | string[]): Promise<string | string[]>;
    urlAll(): Promise<string[]>;
    upgrade(names: string | string[]): Promise<boolean | boolean[]>;
    upgradeAll(): Promise<boolean[]>;
    regenerateCert(names: string | string[]): Promise<boolean | boolean[]>;
    regenerateAllCert(): Promise<boolean[]>;
    ssh(names: string | string[], cmd: string): Promise<string | string[]>;
    protected _namesExec<R>(names: string | string[], fn: (name: string) => Promise<R>): Promise<R | R[]>;
    protected _listExec<R>(fn: (nameLstring) => Promise<R>): Promise<R[]>;
    protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<R[]>;
    protected _bexec(command: string[]): Promise<boolean>;
    protected _exec(command: string[]): Promise<string>;
}
export declare var dm: DockerMachine;
