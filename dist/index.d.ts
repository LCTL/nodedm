declare module 'nodedm' {
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
	export class MachineStatus {
	    static STOPPED: string;
	    static RUNNING: string;
	    static TIMEOUT: string;
	    static ERROR: string;
	    static NOT_EXIST: string;
	    static ALL: string[];
	    static valueOf(state: string): string;
	}
	export class DockerMachine {
	    path: string;
	    constructor(path: string);
	    active(options?: any): Promise<string>;
	    config(names: string | string[], options?: any): Promise<string | Map<string>>;
	    create(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    env(names: string | string[], options?: any): Promise<string | Map<string>>;
	    inspect(names: string | string[], options?: any): Promise<any | Map<any>>;
	    inspectAll(options?: any): Promise<Map<any>>;
	    ip(names: string | string[], options?: any): Promise<string | Map<string>>;
	    ipAll(options?: any): Promise<Map<string>>;
	    kill(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    killAll(options?: any): Promise<Map<boolean>>;
	    ls(options?: any): Promise<Machine[] | string[]>;
	    regenerateCert(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    regenerateAllCert(options?: any): Promise<Map<boolean>>;
	    restart(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    restartAll(options?: any): Promise<Map<boolean>>;
	    rm(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    rmAll(options?: any): Promise<Map<boolean>>;
	    ssh(names: string | string[], cmd: string, options?: any): Promise<string | Map<string>>;
	    sshAll(cmd: string, options?: any): Promise<Map<string>>;
	    scp(from: string, to: string, options?: any): Promise<string>;
	    start(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    startAll(options?: any): Promise<Map<boolean>>;
	    status(names: string | string[], options?: any): Promise<string | Map<string>>;
	    statusAll(options?: any): Promise<Map<string>>;
	    stop(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    stopAll(options?: any): Promise<Map<boolean>>;
	    upgrade(names: string | string[], options?: any): Promise<boolean | Map<boolean>>;
	    upgradeAll(options?: any): Promise<Map<boolean>>;
	    url(names: string | string[], options?: any): Promise<string | Map<string>>;
	    urlAll(options?: any): Promise<Map<string>>;
	    exec(command: string, options?: any): Promise<string>;
	    protected _namesBooleanResult(names: string | string[], cmd: string, options?: any): Promise<boolean | Map<boolean>>;
	    protected _namesStringResult(names: string | string[], cmd: string, options?: any): Promise<string | Map<string>>;
	    protected _createCmdWithOptions(cmd: string[], options: Map<string>): string[];
	    protected _namesExec<R>(names: string | string[], fn: (name: string) => Promise<R>): Promise<R | Map<R>>;
	    protected _listExec<R>(fn: (name: string) => Promise<R>): Promise<Map<R>>;
	    protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<Map<R>>;
	    protected _bexec(command: string[]): Promise<boolean>;
	    protected _exec(command: string[]): Promise<string>;
	}
	export var dm: DockerMachine;

}
