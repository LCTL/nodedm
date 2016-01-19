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

  static STOPPED: string = 'Stopped';
  static RUNNING: string = 'Running';
  static TIMEOUT: string = 'Timeout';
  static ERROR: string = 'Error';
  static NOT_EXIST: string = 'Not Exist';

  static ALL: string[] = [
    MachineStatus.STOPPED,
    MachineStatus.RUNNING,
    MachineStatus.TIMEOUT,
    MachineStatus.ERROR,
    MachineStatus.NOT_EXIST];

  static valueOf(state: string): string {
    for (let status of MachineStatus.ALL) {
      if (state.toLowerCase() === status.toLowerCase()) {
        return status;
      }
    }
    return MachineStatus.NOT_EXIST;
  }

}

export class DockerMachine {

  constructor(public path: string) {}

  active(options?: any): Promise<string> {
    return this._exec(this._createCmdWithOptions(['action'], options));
  }

  config(names: string|string[], options?: any): Promise<string|Map<string>> {
    return this._namesStringResult(names, 'config', options);
  }

  create(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'create', options);
  }

  env(names: string|string[], options?: any): Promise<string|Map<string>> {
    return this._namesStringResult(names, 'env', options);
  }

  inspect(names: string|string[], options?: any): Promise<any|Map<any>> {
    var fn = (name: string) => this._exec(this._createCmdWithOptions(['inspect', name], options)).then(out => JSON.parse(out));
    return this._namesExec(names, fn);
  }

  inspectAll(options?: any): Promise<Map<any>> {
    return this._listExec(name => this.inspect(name, options));
  }

  ip(names: string|string[], options?: any): Promise<string|Map<string>> {
    return this._namesStringResult(names, 'ip', options);
  }

  ipAll(options?: any): Promise<Map<string>> {
    return this._listExec(name => this.ip(name, options));
  }

  kill(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'kill', options);
  }

  killAll(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.kill(name, options));
  }

  ls(options?: any): Promise<Machine[]|string[]> {
    return this._exec(this._createCmdWithOptions(['ls'], options)).then(result => {
      var
        lines: string[] = result.trim().split('\n'),
        nameIndex: number = lines[0].indexOf('NAME'),
        activeIndex: number = lines[0].indexOf('ACTIVE'),
        driverIndex: number = lines[0].indexOf('DRIVER'),
        stateIndex: number = lines[0].indexOf('STATE'),
        urlIndex: number = lines[0].indexOf('URL'),
        swarmIndex: number = lines[0].indexOf('SWARM');

      if (nameIndex === -1
        || activeIndex === -1
        || driverIndex === -1
        || driverIndex === -1
        || stateIndex === -1
        || urlIndex === -1
        || swarmIndex === -1) {
        return lines.map(line => line.trim());
      } else {
        let machines: Machine[] = [];
        lines.forEach((line, index) => {
          if (index > 0 && line !== null && line !== '') {
            machines.push({
              name: line.substring(nameIndex, activeIndex - 1).trim(),
              active: line.substring(activeIndex, driverIndex - 1).trim() === '*',
              driver: line.substring(driverIndex, stateIndex - 1).trim(),
              state: MachineStatus.valueOf(line.substring(stateIndex, urlIndex - 1).trim()),
              url: line.substring(urlIndex, swarmIndex - 1).trim(),
              swarm: line.substring(swarmIndex).trim()
            });
          }
        });
        return machines;
      }
    });
  };

  regenerateCert(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'regenerate-certs -f', options);
  }

  regenerateAllCert(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.regenerateCert(name, options));
  }

  restart(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'restart', options);
  }

  restartAll(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.restart(name, options));
  }

  rm(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'rm', options);
  }

  rmAll(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.rm(name, options));
  }

  ssh(names: string|string[], cmd: string, options?: any): Promise<string|Map<string>> {
    var fn = (name: string) => this._exec(this._createCmdWithOptions(['ssh', name, '"' + cmd + '"'], options));
    return this._namesExec(names, fn);
  }

  sshAll(cmd: string, options?: any): Promise<Map<string>> {
    return this._listExec(name => this.ssh(name, cmd, options));
  }

  scp(from: string, to: string, options?: any): Promise<string> {
    var command = this._createCmdWithOptions(['scp'], options);
    return this._exec(command);
  }

  start(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'start', options);
  }

  startAll(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.start(name, options));
  }

  status(names: string|string[], options?: any): Promise<string|Map<string>> {
    var fn = (name: string) => {
      return new Promise<string>((resolve, reject) => {
        this._exec(this._createCmdWithOptions(['status', name], options)).then((out: string) => {
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

  statusAll(options?: any): Promise<Map<string>> {
    return this._listExec(name => this.status(name, options));
  }

  stop(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'stop', options);
  }

  stopAll(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.stop(name, options));
  }

  upgrade(names: string|string[], options?: any): Promise<boolean|Map<boolean>> {
    return this._namesBooleanResult(names, 'upgrade', options);
  }

  upgradeAll(options?: any): Promise<Map<boolean>> {
    return this._listExec(name => this.upgrade(name, options));
  }

  url(names: string|string[], options?: any): Promise<string|Map<string>> {
    return this._namesStringResult(names, 'url', options);
  }

  urlAll(options?: any): Promise<Map<string>> {
    return this._listExec(name => this.url(name, options));
  }

  exec(command: string, options?: any): Promise<string> {
    return this._exec(this._createCmdWithOptions(command.split(' '), options));
  }

  protected _namesBooleanResult(names: string|string[], cmd: string, options?: any): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(this._createCmdWithOptions(cmd.split(' ').concat([name]), options));
    return this._namesExec(names, fn);
  }

  protected _namesStringResult(names: string|string[], cmd: string, options?: any): Promise<string|Map<string>> {
    var fn = (name: string) => this._exec(this._createCmdWithOptions(cmd.split(' ').concat([name]), options));
    return this._namesExec(names, fn);
  }

  protected _createCmdWithOptions(cmd: string[], options: Map<string>): string[] {
    var optionValues: string[] = [];
    if (options) {
      Object.keys(options).forEach(key => {
        if (key.length === 1) {
          optionValues.push('-' + key);
        } else {
          optionValues.push('--' + key);
        }

        if (options[key]) {
          optionValues.push(options[key]);
        } else {
          optionValues.push('');
        }
      })
    }
    return cmd.concat(optionValues);
  }

  protected _namesExec<R>(names: string|string[], fn: (name: string) => Promise<R>): Promise<R|Map<R>> {
    return Array.isArray(names) ? this._batchExec(names, fn) : fn(names);
  }

  protected _listExec<R>(fn: (name: string) => Promise<R>): Promise<Map<R>> {
    return this.ls({q: ''}).then((names: string[]) => this._batchExec(names, fn));
  }

  protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<Map<R>> {
    var promises: Promise<Entry<R>>[] = [];
    names.forEach((name) => {
      var pramise = fn.apply(this, [name]).then((result: R) => {
        return {
          name: name,
          value: result
        };
      });
      promises.push(pramise);
    });
    return Promise.all(promises).then((entries: Entry<R>[]) => {
      var map: Map<R> = {};
      entries.forEach((entry: Entry<R>) => map[entry.name] = entry.value)
      return map;
    });
  }

  protected _bexec(command: string[]): Promise<boolean> {
    return this._exec(command).then((out: string) => true);
  }

  protected _exec(command: string[]): Promise<string> {
    var fullCommand: string[] = command.slice();
    return new Promise<String>((resolve, reject) => {
      child_process.exec(`${this.path} ` + fullCommand.join(' '), function(error, stdout, stderr) {
        if (error) {
          reject(new Error(stderr.toString().trim()));
        } else {
          resolve(stdout.toString().trim());
        }
      });
    })
  };

};

export var dm = new DockerMachine('docker-machine');
