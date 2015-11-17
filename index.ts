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

  active(): Promise<string> {
    return this._exec(['active']);
  }

  config(names: string|string[]): Promise<string|Map<string>> {
    var fn = (name: string) => this._exec(['config', name]);
    return this._namesExec(names, fn);
  }

  create(names: string|string[], driver: Driver, swarm?: Swarm): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => {
      var options: string[] = ['create', name].concat(this._driveOptions(driver));
      if (swarm) {
        options = options.concat(this._swarmOptions(swarm));
      }
      return this._bexec(options);
    }
    return this._namesExec(names, fn);
  }

  env(names: string|string[], config?: EnvConfig): Promise<string|Map<string>> {
    var fn = (name: string) => {
      var command = ['env', name]
      var fn = null;

      if (config.swarm === true) {
        command.push('--swarm')
      }

      if (config.shell) {
        command = command.concat(['--shell', config.shell])
      }

      if (config.unset === true) {
        command = command.concat(['--unset'])
      }

      return this._exec(command);
    }

    return this._namesExec(names, fn);
  }

  inspect(names: string|string[]): Promise<any|Map<any>> {
    var fn = (name: string) => this._exec(['inspect', name]).then((out: string) => JSON.parse(out));
    return this._namesExec(names, fn);
  }

  inspectAll(): Promise<Map<any>> {
    return this._listExec(this.inspect);
  }

  ip(names: string|string[]): Promise<string|Map<string>> {
    var fn = (name: string) => this._exec(['ip', name]);
    return this._namesExec(names, fn);
  }

  ipAll(): Promise<Map<string>> {
    return this._listExec(this.ip);
  }

  kill(names: string|string[]): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(['kill', name]);
    return this._namesExec(names, fn);
  }

  killAll(): Promise<Map<boolean>> {
    return this._listExec(this.kill);
  }

  ls(): Promise<Machine[]> {

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

  regenerateCert(names: string|string[]): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(['regenerate-certs', '-f', name]);
    return this._namesExec(names, fn);
  }

  regenerateAllCert(): Promise<Map<boolean>> {
    return this._listExec(this.regenerateCert);
  }

  restart(names: string|string[]): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(['restart', name]);
    return this._namesExec(names, fn);
  }

  restartAll(): Promise<Map<boolean>> {
    return this._listExec(this.restart);
  }

  rm(names: string|string[], force?: boolean): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => {
      var command = ['rm', name];
      if (force) {
        command.push('-f');
      }
      return this._bexec(command);
    };
    return this._namesExec(names, fn);
  }

  rmAll(force?: boolean): Promise<Map<boolean>> {
    var _this = this;
    return this._listExec(name => _this.rm(name, force));
  }

  ssh(names: string|string[], cmd: string): Promise<string|Map<string>> {
    var fn = (name: string) => this._exec(['ssh', name, '"' + cmd + '"']);
    return this._namesExec(names, fn);
  }

  sshAll(cmd: string) : Promise<Map<string>> {
    var _this = this;
    return this._listExec(name => _this.ssh(name, cmd));
  }

  scp(from: string, to: string, recursive: boolean): Promise<string> {
    var command = ['scp'];
    if (recursive) {
      command.push('-r');
    }
    command = command.concat([from, to]);
    return this._exec(command);
  }

  start(names: string|string[]): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(['start', name]);
    return this._namesExec(names, fn);
  }

  startAll(): Promise<Map<boolean>> {
    return this._listExec(this.start);
  }

  status(names: string|string[]): Promise<string|Map<string>> {
    var _this = this;
    var fn = (name: string) => {
      return new Promise<string>((resolve, reject) => {
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

  statusAll(): Promise<Map<string>> {
    return this._listExec(this.status);
  }

  stop(names: string|string[]): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(['stop', name]);
    return this._namesExec(names, fn);
  }

  stopAll(): Promise<Map<boolean>> {
    return this._listExec(this.stop);
  }

  upgrade(names: string|string[]): Promise<boolean|Map<boolean>> {
    var fn = (name: string) => this._bexec(['upgrade', name]);
    return this._namesExec(names, fn);
  }

  upgradeAll(): Promise<Map<boolean>> {
    return this._listExec(this.upgrade);
  }

  url(names: string|string[]): Promise<string|Map<string>> {
    var fn = (name: string) => this._exec(['url', name]);
    return this._namesExec(names, fn);
  }

  urlAll(): Promise<Map<string>> {
    return this._listExec(this.url);
  }

  protected _driveOptions(driver: Driver): string[] {
    var optionValues: string[];

    if (!driver.name) {
      throw new Error("Must provide driver name");
    }

    optionValues = ['-d', driver.name];
    Object.keys(driver.options).forEach(key => optionValues = optionValues.concat(['--' + key, driver.options[key]]));
    return optionValues;
  }

  protected _swarmOptions(swarm: Swarm): string[] {
    var options: string[] = ['--swarm'];

    if (swarm.master) {
      options.push('--swarm-master');
    }

    this._pushSwarmOption(options, 'swarm-discovery', swarm.discovery);
    this._pushSwarmOption(options, 'swarm-strategy', swarm.strategy);
    this._pushSwarmOption(options, 'swarm-host', swarm.host);
    this._pushSwarmOption(options, 'swarm-addr', swarm.addr);
    this._pushSwarmOption(options, 'swarm-strategy', swarm.strategy);

    if (swarm.opts) {
      for (var opt of swarm.opts) {
        this._pushSwarmOption(options, 'swarm-opt', opt);
      }
    }

    return options;
  }

  protected _pushSwarmOption(options: string[], name: string, value: string) {
    if (value) {
      options.push('--' + name);
      options.push(value);
    }
  }

  protected _namesExec<R>(names: string|string[], fn: (name: string) => Promise<R>): Promise<R|Map<R>> {
    return Array.isArray(names) ? this._batchExec(names, fn) : fn(names);
  }

  protected _listExec<R>(fn: (name: string) => Promise<R>): Promise<Map<R>> {
    var _this = this;
    return _this.ls().then((machines: Machine[]) => {
      var names: string[] = machines.map((machine: Machine) => machine.name);
      return _this._batchExec(names, fn);
    })
  }

  protected _batchExec<R>(names: string[], fn: (name: string) => Promise<R>): Promise<Map<R>> {
    var _this = this;
    var promises: Promise<Entry<R>>[] = [];
    names.forEach((name) => {
      var pramise = fn.apply(_this, [name]).then((result: R) => {
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
    fullCommand.unshift('docker-machine');
    return new Promise<String>((resolve, reject) => {
      child_process.exec(fullCommand.join(' '), function(error, stdout, stderr) {
        if (error) {
          reject(new Error(stderr.toString().trim()));
        } else {
          resolve(stdout.toString().trim());
        }
      });
    })
  };

};

export var dm = new DockerMachine();
