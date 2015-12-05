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
    DockerMachine.prototype.active = function (options) {
        return this._exec(this._createCmdWithOptions(['action'], options));
    };
    DockerMachine.prototype.config = function (names, options) {
        return this._namesStringResult(names, 'config', options);
    };
    DockerMachine.prototype.create = function (names, options) {
        return this._namesBooleanResult(names, 'create', options);
    };
    DockerMachine.prototype.env = function (names, options) {
        return this._namesStringResult(names, 'env', options);
    };
    DockerMachine.prototype.inspect = function (names, options) {
        var _this = this;
        var fn = function (name) { return _this._exec(_this._createCmdWithOptions(['inspect', name], options)).then(function (out) { return JSON.parse(out); }); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.inspectAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.inspect(name, options); });
    };
    DockerMachine.prototype.ip = function (names, options) {
        return this._namesStringResult(names, 'ip', options);
    };
    DockerMachine.prototype.ipAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.ip(name, options); });
    };
    DockerMachine.prototype.kill = function (names, options) {
        return this._namesBooleanResult(names, 'kill', options);
    };
    DockerMachine.prototype.killAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.kill(name, options); });
    };
    DockerMachine.prototype.ls = function (options) {
        return this._exec(this._createCmdWithOptions(['ls'], options)).then(function (result) {
            var lines = result.trim().split('\n'), nameIndex = lines[0].indexOf('NAME'), activeIndex = lines[0].indexOf('ACTIVE'), driverIndex = lines[0].indexOf('DRIVER'), stateIndex = lines[0].indexOf('STATE'), urlIndex = lines[0].indexOf('URL'), swarmIndex = lines[0].indexOf('SWARM');
            if (nameIndex === -1
                || activeIndex === -1
                || driverIndex === -1
                || driverIndex === -1
                || stateIndex === -1
                || urlIndex === -1
                || swarmIndex === -1) {
                return lines.map(function (line) { return line.trim(); });
            }
            else {
                var machines = [];
                lines.forEach(function (line, index) {
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
    ;
    DockerMachine.prototype.regenerateCert = function (names, options) {
        return this._namesBooleanResult(names, 'regenerate-certs -f', options);
    };
    DockerMachine.prototype.regenerateAllCert = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.regenerateCert(name, options); });
    };
    DockerMachine.prototype.restart = function (names, options) {
        return this._namesBooleanResult(names, 'restart', options);
    };
    DockerMachine.prototype.restartAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.restart(name, options); });
    };
    DockerMachine.prototype.rm = function (names, options) {
        return this._namesBooleanResult(names, 'rm', options);
    };
    DockerMachine.prototype.rmAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.rm(name, options); });
    };
    DockerMachine.prototype.ssh = function (names, cmd, options) {
        var _this = this;
        var fn = function (name) { return _this._exec(_this._createCmdWithOptions(['ssh', name, '"' + cmd + '"'], options)); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype.sshAll = function (cmd, options) {
        var _this = this;
        return this._listExec(function (name) { return _this.ssh(name, cmd, options); });
    };
    DockerMachine.prototype.scp = function (from, to, options) {
        var command = this._createCmdWithOptions(['scp'], options);
        return this._exec(command);
    };
    DockerMachine.prototype.start = function (names, options) {
        return this._namesBooleanResult(names, 'start', options);
    };
    DockerMachine.prototype.startAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.start(name, options); });
    };
    DockerMachine.prototype.status = function (names, options) {
        var _this = this;
        var fn = function (name) {
            return new es6_promise_1.Promise(function (resolve, reject) {
                _this._exec(_this._createCmdWithOptions(['status', name], options)).then(function (out) {
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
    DockerMachine.prototype.statusAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.status(name, options); });
    };
    DockerMachine.prototype.stop = function (names, options) {
        return this._namesBooleanResult(names, 'stop', options);
    };
    DockerMachine.prototype.stopAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.stop(name, options); });
    };
    DockerMachine.prototype.upgrade = function (names, options) {
        return this._namesBooleanResult(names, 'upgrade', options);
    };
    DockerMachine.prototype.upgradeAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.upgrade(name, options); });
    };
    DockerMachine.prototype.url = function (names, options) {
        return this._namesStringResult(names, 'url', options);
    };
    DockerMachine.prototype.urlAll = function (options) {
        var _this = this;
        return this._listExec(function (name) { return _this.url(name, options); });
    };
    DockerMachine.prototype.exec = function (command, options) {
        return this._exec(this._createCmdWithOptions(command.split(' '), options));
    };
    DockerMachine.prototype._namesBooleanResult = function (names, cmd, options) {
        var _this = this;
        var fn = function (name) { return _this._bexec(_this._createCmdWithOptions(cmd.split(' ').concat([name]), options)); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype._namesStringResult = function (names, cmd, options) {
        var _this = this;
        var fn = function (name) { return _this._exec(_this._createCmdWithOptions(cmd.split(' ').concat([name]), options)); };
        return this._namesExec(names, fn);
    };
    DockerMachine.prototype._createCmdWithOptions = function (cmd, options) {
        var optionValues = [];
        if (options) {
            Object.keys(options).forEach(function (key) {
                if (key.length === 1) {
                    optionValues.push('-' + key);
                }
                else {
                    optionValues.push('--' + key);
                }
                if (options[key]) {
                    optionValues.push(options[key]);
                }
                else {
                    optionValues.push('');
                }
            });
        }
        return cmd.concat(optionValues);
    };
    DockerMachine.prototype._namesExec = function (names, fn) {
        return Array.isArray(names) ? this._batchExec(names, fn) : fn(names);
    };
    DockerMachine.prototype._listExec = function (fn) {
        var _this = this;
        return this.ls({ q: '' }).then(function (names) { return _this._batchExec(names, fn); });
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
                    reject(new Error(stderr.toString().trim()));
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
