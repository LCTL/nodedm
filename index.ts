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

export interface DriverOption {
  name: string;
  required: boolean;
  pattern?: RegExp;
}

export interface Driver {
  getName(): string;
  setOptionValue(optionName: string, optionValue: string): void;
  toCommandOptions(): string[];
}

export abstract class AbstractDriver implements Driver {

  public options: { [key: string]: DriverOption; } = {};
  public values: { [key: string]: string; } = {};

  constructor(public name: string, options: DriverOption[]) {
    options.forEach((opnion: DriverOption) => this.options[opnion.name] = opnion);
  }

  getName(): string {
    return this.name;
  }

  setOptionValue(optionName: string, optionValue: string): void {
    this.values[optionName] = optionValue
  }

  toCommandOptions(): string[] {
    var optionValues: string[] = ['-d', this.name];

    for (let name in this.options) {
      var option = this.options[name]
      var value = this.values[name];
      if (option.required && value === null) {
        throw new Error('Option: ' + option.name + ' required');
      }

      if (option.hasOwnProperty('pattern') && !!value && !value.match(option.pattern)) {
        throw new Error('Option: ' + option.name + ' pattern: ' + option.pattern.toString() + ' not match');
      }
    }

    for (let name in this.values) {
      var value = this.values[name];
      optionValues.push('--' + name);
      optionValues.push(value);
    }

    return optionValues;
  }

}

export class VirtualBoxDriver extends AbstractDriver {

  static OPTION_MEMORY = {
    name: 'virtualbox-memory',
    required: false,
    pattern: /[0-9]+/
  };

  static OPTION_CPU_COUNT = {
    name: 'virtualbox-cpu-count',
    required: false,
    pattern: /[0-9]+/
  };

  static OPTION_DISK_SIZE = {
    name: 'virtualbox-disk-size',
    required: false,
    pattern: /[0-9]+/
  };

  static OPTION_BOOT_2_DOCKER_RUL = {
    name: 'virtualbox-boot2docker-url',
    required: false
  }

  static OPTION_IMPORT_BOOT_2_DOCKER_VM = {
    name: 'virtualbox-import-boot2docker-vm',
    required: false
  }

  static OPTION_HOSTONLY_CIDR = {
    name: 'virtualbox-hostonly-cidr',
    required: false
  }

  static OPTION_HOSTONLY_NICTYPE = {
    name: 'virtualbox-hostonly-nictype',
    required: false
  }

  static OPTION_HOSTONLY_NICPROMISC = {
    name: 'virtualbox-hostonly-nicpromisc',
    required: false
  }

  static OPTION_NO_SHARE = {
    name: 'virtualbox-no-share',
    required: false
  }

  constructor() {
    super('virtualbox', [
      VirtualBoxDriver.OPTION_MEMORY,
      VirtualBoxDriver.OPTION_CPU_COUNT,
      VirtualBoxDriver.OPTION_DISK_SIZE,
      VirtualBoxDriver.OPTION_BOOT_2_DOCKER_RUL,
      VirtualBoxDriver.OPTION_IMPORT_BOOT_2_DOCKER_VM,
      VirtualBoxDriver.OPTION_HOSTONLY_CIDR,
      VirtualBoxDriver.OPTION_HOSTONLY_NICTYPE,
      VirtualBoxDriver.OPTION_HOSTONLY_NICPROMISC,
      VirtualBoxDriver.OPTION_NO_SHARE,
    ]);
  }

}

export class GenericDriver extends AbstractDriver {

  static OPTION_IP_ADDRESS = {
    name: 'generic-ip-address',
    required: true,
    pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
  };

  static OPTION_SSH_USER = {
    name: 'generic-ssh-user',
    required: false,
  }

  static OPTION_SSH_KEY = {
    name: 'generic-ssh-key',
    required: false,
  }

  static OPTION_SSH_PORT = {
    name: 'generic-ssh-port',
    required: false,
  }

  constructor() {
    super('virtualbox', [
      GenericDriver.OPTION_IP_ADDRESS,
      GenericDriver.OPTION_SSH_USER,
      GenericDriver.OPTION_SSH_KEY,
      GenericDriver.OPTION_SSH_PORT
    ]);
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
    for (var status of MachineStatus.ALL) {
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

        for (var i = 1; i < lines.length; i++) {

          var line: string = lines[i];

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

  create(names: string|string[], driver: Driver): Promise<boolean|boolean[]> {
    var fn = (name: string) => this._bexec(['create', name].concat(driver.toCommandOptions()));
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
          if (out.match(/not exist/ig)) {
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

  protected _namesExec<R>(names: string|string[], fn: (name: string) => Promise<R>): Promise<R|R[]> {
    return Array.isArray(names) ? this._batchExec(names, fn) : fn(names);
  }

  protected _listExec<R>(fn:(nameLstring) => Promise<R>): Promise<R[]> {
    var _this = this;
    return _this.list().then((machines: Machine[]) => {
      var names: string[] = machines.map((machine: Machine) => machine.name);
      return _this._batchExec(names, fn);
    })
  }

  protected _batchExec<R>(names: string[], fn:(name:string) => Promise<R>): Promise<R[]> {
    var _this = this;
    var promises: Promise<R>[] = [];
    names.forEach((name) => promises.push(fn.apply(_this, [name])));
    return Promise.all(promises);
  }

  protected _bexec(command:string[]): Promise<boolean>{
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
