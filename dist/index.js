var child_process = require('child_process');
var es6_promise_1 = require('es6-promise');
var MachineStatus = (function () {
    function MachineStatus() {
    }
    MachineStatus.valueOf = function (state) {
        for (var _i = 0, _a = MachineStatus.ALL; _i < _a.length; _i++) {
            var status_1 = _a[_i];
            if (state.toLowerCase() === status_1.toLowerCase()) {
                return status_1;
            }
        }
        return MachineStatus.NOT_EXIST;
    };
    MachineStatus.STOPPED = 'Stopped';
    MachineStatus.RUNNING = 'Running';
    MachineStatus.TIMEOUT = 'Timeout';
    MachineStatus.ERROR = 'Error';
    MachineStatus.NOT_EXIST = 'Not Exist';
    MachineStatus.ALL = [
        MachineStatus.STOPPED,
        MachineStatus.RUNNING,
        MachineStatus.TIMEOUT,
        MachineStatus.ERROR,
        MachineStatus.NOT_EXIST];
    return MachineStatus;
})();
exports.MachineStatus = MachineStatus;
var DockerMachine = (function () {
    function DockerMachine() {
    }
    DockerMachine.prototype.ls = function () {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._exec(['ls']).then(function (out) {
                var lines = out.split('\n'), nameIndex = lines[0].indexOf('NAME'), activeIndex = lines[0].indexOf('ACTIVE'), driverIndex = lines[0].indexOf('DRIVER'), stateIndex = lines[0].indexOf('STATE'), urlIndex = lines[0].indexOf('URL'), swarmIndex = lines[0].indexOf('SWARM'), machines = [];
                for (var i = 1; i < lines.length; i++) {
                    var line = lines[i];
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
                    });
                }
                resolve(machines);
            }).catch(function (out) { return reject(out); });
        });
    };
    ;
    DockerMachine.prototype.create = function (names, driver, swarm) {
        var _this = this;
        var fn = function (name) {
            var options = ['create', name].concat(_this._driveOptions(driver));
            if (swarm) {
                options = options.concat(_this._swarmOptions(swarm));
            }
            return _this._bexec(options);
        };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.inspect = function (names) {
        var _this = this;
        var fn = function (name) { return _this._exec(['inspect', name]).then(function (out) { return JSON.parse(out); }); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.inspectAll = function () {
        return this._listExec(this.inspect);
    };
    DockerMachine.prototype.remove = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['rm', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.removeAll = function () {
        return this._listExec(this.remove);
    };
    DockerMachine.prototype.start = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['start', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.startAll = function () {
        return this._listExec(this.start);
    };
    DockerMachine.prototype.stop = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['stop', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.stopAll = function () {
        return this._listExec(this.stop);
    };
    DockerMachine.prototype.restart = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['restart', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.restartAll = function () {
        return this._listExec(this.restart);
    };
    DockerMachine.prototype.kill = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['kill', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.killAll = function () {
        return this._listExec(this.kill);
    };
    DockerMachine.prototype.status = function (names) {
        var _this = this;
        var fn = function (name) {
            return new es6_promise_1.Promise(function (resolve, reject) {
                _this._exec(['status', name]).then(function (out) {
                    resolve(MachineStatus.valueOf(out));
                }).catch(function (out) {
                    if (/not exist/ig.test(out)) {
                        resolve(MachineStatus.NOT_EXIST);
                    }
                    else {
                        reject(out);
                    }
                });
            });
        };
        return this._namesExec(names, fn);
    };
    ;
    DockerMachine.prototype.statusAll = function () {
        return this._listExec(this.status);
    };
    DockerMachine.prototype.ip = function (names) {
        var _this = this;
        var fn = function (name) { return _this._exec(['ip', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.ipAll = function () {
        return this._listExec(this.ip);
    };
    DockerMachine.prototype.url = function (names) {
        var _this = this;
        var fn = function (name) { return _this._exec(['url', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.urlAll = function () {
        return this._listExec(this.url);
    };
    DockerMachine.prototype.upgrade = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['upgrade', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.upgradeAll = function () {
        return this._listExec(this.upgrade);
    };
    DockerMachine.prototype.regenerateCert = function (names) {
        var _this = this;
        var fn = function (name) { return _this._bexec(['regenerate-certs', '-f', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.regenerateAllCert = function () {
        return this._listExec(this.regenerateCert);
    };
    DockerMachine.prototype.ssh = function (names, cmd) {
        var _this = this;
        var fn = function (name) { return _this._exec(['ssh', name, '"' + cmd + '"']); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.scp = function (from, to, recursive) {
        var command = ['scp'];
        if (recursive) {
            command.push('-r');
        }
        command = command.concat([from, to]);
        return this._exec(command);
    };
    DockerMachine.prototype.active = function () {
        return this._exec(['active']);
    };
    DockerMachine.prototype.config = function (names) {
        var _this = this;
        var fn = function (name) { return _this._exec(['config', name]); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.env = function (names, config) {
        var _this = this;
        var fn = function (name) {
            var command = ['env', name];
            var fn = null;
            if (config.swarm === true) {
                command.push('--swarm');
            }
            if (config.shell) {
                command = command.concat(['--shell', config.shell]);
            }
            if (config.unset === true) {
                command = command.concat(['--unset']);
            }
            return _this._exec(command);
        };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype._driveOptions = function (driver) {
        var optionValues;
        if (!driver.name) {
            throw new Error("Must provide driver name");
        }
        optionValues = ['-d', driver.name];
        Object.keys(driver.options).forEach(function (key) { return optionValues = optionValues.concat(['--' + key, driver.options[key]]); });
        return optionValues;
    };
    DockerMachine.prototype._swarmOptions = function (swarm) {
        var options = ['--swarm'];
        if (swarm.master) {
            options.push('--swarm-master');
        }
        this._pushSwarmOption(options, 'swarm-discovery', swarm.discovery);
        this._pushSwarmOption(options, 'swarm-strategy', swarm.strategy);
        this._pushSwarmOption(options, 'swarm-host', swarm.host);
        this._pushSwarmOption(options, 'swarm-addr', swarm.addr);
        this._pushSwarmOption(options, 'swarm-strategy', swarm.strategy);
        if (swarm.opts) {
            for (var _i = 0, _a = swarm.opts; _i < _a.length; _i++) {
                var opt = _a[_i];
                this._pushSwarmOption(options, 'swarm-opt', opt);
            }
        }
        return options;
    };
    DockerMachine.prototype._pushSwarmOption = function (options, name, value) {
        if (value) {
            options.push('--' + name);
            options.push(value);
        }
    };
    DockerMachine.prototype._namesExec = function (names, fn) {
        return Array.isArray(names) ? this._batchExec(names, fn) : fn(names);
    };
    DockerMachine.prototype._listExec = function (fn) {
        var _this = this;
        return _this.ls().then(function (machines) {
            var names = machines.map(function (machine) { return machine.name; });
            return _this._batchExec(names, fn);
        });
    };
    DockerMachine.prototype._batchExec = function (names, fn) {
        var _this = this;
        var promises = [];
        names.forEach(function (name) {
            var pramise = fn.apply(_this, [name]).then(function (result) {
                return {
                    name: name,
                    value: result
                };
            });
            promises.push(pramise);
        });
        return es6_promise_1.Promise.all(promises).then(function (entries) {
            var map = {};
            entries.forEach(function (entry) { return map[entry.name] = entry.value; });
            return map;
        });
    };
    DockerMachine.prototype._bexec = function (command) {
        return this._exec(command).then(function (out) { return true; });
    };
    DockerMachine.prototype._exec = function (command) {
        var fullCommand = command.slice();
        fullCommand.unshift('docker-machine');
        return new es6_promise_1.Promise(function (resolve, reject) {
            child_process.exec(fullCommand.join(' '), function (error, stdout, stderr) {
                if (error) {
                    reject(stderr.toString().trim());
                }
                else {
                    resolve(stdout.toString().trim());
                }
            });
        });
    };
    ;
    return DockerMachine;
})();
exports.DockerMachine = DockerMachine;
;
exports.dm = new DockerMachine();
