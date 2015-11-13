import * as child_process from 'child_process';
import {Promise} from 'es6-promise';

export interface Machine {
  name: string;
  active: boolean;
  driver: string;
  state: MachineStatus;
  url: string;
  swarm: string;
}

export class Driver {

  options: { [key: string]: string; } = {};

  constructor(public name: string, options?: { [key: string]: string; })  {
    if (!options) {
      this.options = options;
    }
  }

  toCommandOptions(): string[] {
    var optionValues: string[] = ['-d', this.name];
    Object.keys(this.options).forEach((key) => optionValues = optionValues.concat(['--' + key, this.options[key]]));
    return optionValues;
  }

}

export class Swarm {

  master: boolean = false;
  discovery: string;
  strategy: string;
  host: string;
  addr: string;
  opts: string[] = [];

  toCommandOptions(): string[] {

    var options: string[] = ['--swarm'];

    if (this.master) {
      options.push('--swarm-master');
    }

    this._push(options, 'swarm-discovery', this.discovery, (name) => {
      throw new Error('Swarm discovery option cannot be empty');
    });

    this._push(options, 'swarm-strategy', this.strategy);
    this._push(options, 'swarm-host', this.host);
    this._push(options, 'swarm-addr', this.addr);
    this._push(options, 'swarm-strategy', this.strategy);

    for (var opt of this.opts) {
      this._push(options, 'swarm-opt', opt);
    }

    return options;

  }

  protected _push(options:string[], name:string, value:string, emptyCallback?:(name: string) => void){
    if (value) {
      options.push('--' + name);
      options.push(value);
    } else if (emptyCallback) {
      emptyCallback(name);
    }
  }

}

export class MachineStatus {

  static STOPPED: MachineStatus = new MachineStatus('Stopped');
  static RUNNING: MachineStatus = new MachineStatus('Running');
  static TIMEOUT: MachineStatus = new MachineStatus('Timeout');
  static ERROR: MachineStatus = new MachineStatus('Error');
  static NOT_EXIST: MachineStatus = new MachineStatus('Not Exist');

  static ALL: MachineStatus[] = [
    MachineStatus.STOPPED,
    MachineStatus.RUNNING,
    MachineStatus.TIMEOUT,
    MachineStatus.ERROR,
    MachineStatus.NOT_EXIST];

  static valueOf(state: string): MachineStatus {
    for (let status of MachineStatus.ALL) {
      if (state.toLowerCase() === status.value.toLowerCase()) {
        return status;
      }
    }
    return MachineStatus.NOT_EXIST;
  }

  constructor(private value: string) { }

}

export class DockerMachine {

  list(): Promise<Machine[]> {

    var _this = this;

    return new Promise<Machine[]>(function(resolve, reject) {

      _this._exec(['ls']).then(function(out: string) {

        var
          lines: string[] = out.split('\n'),
          nameIndex: number = lines[0].indexOf('NAME'),
          activeIndex: number = lines[0].indexOf('ACTIVE'),
          driverIndex: number = lines[0].indexOf('DRIVER'),
          stateIndex: number = lines[0].indexOf('STATE'),
          urlIndex: number = lines[0].indexOf('URL'),
          swarmIndex: number = lines[0].indexOf('SWARM'),
          machines: Machine[] = [];

        for (let i = 1; i < lines.length; i++) {

          let line: string = lines[i];

          if (line === null || line === '') {
            break;
          }

          machines.push({
            name: line.substring(nameIndex, activeIndex - 1).trim(),
            active: line.substring(activeIndex, driverIndex - 1).trim() === '*',
            driver: line.substring(activeIndex, stateIndex - 1).trim(),
            state: MachineStatus.valueOf(line.substring(stateIndex, urlIndex - 1).trim()),
            url: line.substring(urlIndex, swarmIndex - 1).trim(),
            swarm: line.substring(swarmIndex).trim()
          })

        }

        resolve(machines);

      }).catch((out: string) => reject(out));

    });
  };

  create(names: string|string[], driver: Driver, swarm?: Swarm): Promise<boolean|boolean[]> {
    var fn = (name: string) => {
      var options: string[] = ['create', name].concat(driver.toCommandOptions());
      if (swarm){
        options = options.concat(swarm.toCommandOptions());
      }
      return this._bexec(options);
    }
    return this._namesExec(names, fn);
  }

  inspect(names: string|string[]): Promise<any|any[]> {
    var fn = (name: string) => this._exec(['inspect', name]).then((out: string) => JSON.parse(out));
    return this._namesExec(names, fn);
  }

  inspectAll(): Promise<any[]> {
    return this._listExec(this.inspect);
  }

  remove(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['rm', name]);
    return this._namesExec(names, fn);
  }

  removeAll(): Promise<boolean[]> {
    return this._listExec(this.remove);
  }

  start(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['start', name]);
    return this._namesExec(names, fn);
  }

  startAll(): Promise<boolean[]> {
    return this._listExec(this.start);
  }

  stop(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['stop', name]);
    return this._namesExec(names, fn);
  }

  stopAll(): Promise<boolean[]> {
    return this._listExec(this.stop);
  }

  restart(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['restart', name]);
    return this._namesExec(names, fn);
  }

  restartAll(): Promise<boolean[]> {
    return this._listExec(this.restart);
  }

  kill(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['kill', name]);
    return this._namesExec(names, fn);
  }

  killAll(): Promise<boolean[]> {
    return this._listExec(this.kill);
  }

  status(names: string|string[]): Promise<MachineStatus|MachineStatus[]> {
    var _this = this;
    var fn = (name: string) => {
      return new Promise<MachineStatus>((resolve, reject) => {
        _this._exec(['status', name]).then((out: string) => {
          resolve(MachineStatus.valueOf(out))
        }).catch((out: string) => {
          if (/not exist/ig.test(out)) {
            resolve(MachineStatus.NOT_EXIST);
          } else {
            reject(out);
          }
        });
      });
    }
    return this._namesExec(names, fn);
  };

  statusAll(): Promise<MachineStatus[]> {
    return this._listExec(this.status);
  }

  ip(names: string|string[]): Promise<string|string[]> {
    var fn = (name: string) => this._exec(['ip', name]);
    return this._namesExec(names, fn);
  }

  ipAll(): Promise<string[]> {
    return this._listExec(this.ip);
  }

  url(names: string|string[]): Promise<string|string[]> {
    var fn = (name: string) => this._exec(['url', name]);
    return this._namesExec(names, fn);
  }

  urlAll(): Promise<string[]> {
    return this._listExec(this.url);
  }

  upgrade(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['upgrade', name]);
    return this._namesExec(names, fn);
  }

  upgradeAll(): Promise<boolean[]> {
    return this._listExec(this.upgrade);
  }

  regenerateCert(names: string|string[]): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['regenerate-certs', '-f', name]);
    return this._namesExec(names, fn);
  }

  regenerateAllCert(): Promise<boolean[]> {
    return this._listExec(this.regenerateCert);
  }

  ssh(names: string|string[], cmd: string): Promise<string|string[]> {
    var fn = (name: string) => this._exec(['ssh', name, '"' + cmd + '"']);
    return this._namesExec(names, fn);
  }

  protected _namesExec<R>(names: string|string[], fn: (name: string) => Promise<R>): Promise<R|R[]> {
    return Array.isArray(names) ? this._batchExec(names, fn) : fn(names);
  }

  protected _listExec<R>(fn: (nameLstring) => Promise<R>): Promise<R[]> {
    var _this = this;
    return _this.list().then((machines: Machine[]) => {
      var names: string[] = machines.map((machine: Machine) => machine.name);
      return _this._batchExec(names, fn);
    })
  }

  protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<R[]> {
    var _this = this;
    var promises: Promise<R>[] = [];
    names.forEach((name) => promises.push(fn.apply(_this, [name])));
    return Promise.all(promises);
  }

  protected _bexec(command: string[]): Promise<boolean> {
    return this._exec(command).then((out: string) => true);
  }

  protected _exec(command: string[]): Promise<string> {
    var fullCommand: string[] = command.slice();
    fullCommand.unshift('docker-machine');
    return new Promise<String>((resolve, reject) => {
      child_process.exec(fullCommand.join(' '), function(error, stdout, stderr) {
        if (error) {
          reject(stderr.toString().trim());
        } else {
          resolve(stdout.toString().trim());
        }
      });
    })
  };

};

export var dm = new DockerMachine();
