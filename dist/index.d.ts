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
export interface Driver {
    name: string;
    options: Map<string>;
}
export interface Swarm {
    master: boolean;
    discovery?: string;
    host?: string;
    addr?: string;
    strategy?: string;
    opts?: string[];
}
export declare class MachineStatus {
    static STOPPED: string;
    static RUNNING: string;
    static TIMEOUT: string;
    static ERROR: string;
    static NOT_EXIST: string;
    static ALL: string[];
    static valueOf(state: string): string;
}
export declare class DockerMachine {
    ls(): Promise<Machine[]>;
    create(names: string | string[], driver: Driver, swarm?: Swarm): Promise<boolean | Map<boolean>>;
    inspect(names: string | string[]): Promise<any | Map<any>>;
    inspectAll(): Promise<Map<any>>;
    remove(names: string | string[], force?: boolean): Promise<boolean | Map<boolean>>;
    removeAll(force?: boolean): Promise<Map<boolean>>;
    start(names: string | string[]): Promise<boolean | Map<boolean>>;
    startAll(): Promise<Map<boolean>>;
    stop(names: string | string[]): Promise<boolean | Map<boolean>>;
    stopAll(): Promise<Map<boolean>>;
    restart(names: string | string[]): Promise<boolean | Map<boolean>>;
    restartAll(): Promise<Map<boolean>>;
    kill(names: string | string[]): Promise<boolean | Map<boolean>>;
    killAll(): Promise<Map<boolean>>;
    status(names: string | string[]): Promise<string | Map<string>>;
    statusAll(): Promise<Map<string>>;
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
    protected _driveOptions(driver: Driver): string[];
    protected _swarmOptions(swarm: Swarm): string[];
    protected _pushSwarmOption(options: string[], name: string, value: string): void;
    protected _namesExec<R>(names: string | string[], fn: (name: string) => Promise<R>): Promise<R | Map<R>>;
    protected _listExec<R>(fn: (nameLstring) => Promise<R>): Promise<Map<R>>;
    protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<Map<R>>;
    protected _bexec(command: string[]): Promise<boolean>;
    protected _exec(command: string[]): Promise<string>;
}
export declare var dm: DockerMachine;
