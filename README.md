# NodeDM

Docker Machine wrapper for NodeJS.

### Installation

NodeDM communicate with docker-machine command, so you must install Docker Machine on your PC / Server.

1. Install Docker Machine: https://docs.docker.com/machine/install-machine/

2. `npm install nodedm --save`

#### For TypeScript

1. `npm install -g tsd`

2. `npm install nodedm --save`

3. `tsd link`

### Supported command:

- [x] active
- [x] config
- [x] create
- [x] env
- [x] inspect
- [x] ip
- [x] kill
- [x] ls
- [x] regenerate-certs
- [x] restart
- [x] rm
- [x] ssh
- [x] scp
- [x] start
- [x] status
- [x] stop
- [x] upgrade
- [x] url

### API

```
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
```

### How to use

##### ES6 Import / TypeScript
```
import { dm } from 'nodedm'
```

##### CommandJS
```
var nodedm = require('nodedm')
var dm = nodedm.dm
```

#### Example:

##### Change Path
```
// Windows
dm.path = '"C:\\Program Files\\Docker Toolbox\\docker-machine"';

// Linux
dm.path = '/home/lawrence/docker-machine';
```

##### Exec options
```
dm.options = {
  execOptions: {
    env: {
      PATH: '/home/lawrence/'
    }
  }
}
```

##### Create and ls
```
var options = {
  driver: 'virtualbox',
  'virtualbox-memory': '512'
};
dm.create('vbox0', options).then(function(){
  // Do something
});
dm.create(['vbox1', 'vbox2', 'vbox3'], options).then(function(){
  return dm.ls();
}).then(function(machines){
  machines.forEach(function(machine){
    console.log(machine.name);
    console.log(machine.active);
    console.log(machine.driver);
    console.log(machine.state);
    console.log(machine.url);
    console.log(machine.swarm);
  });
});
```

##### Inspect
```
dm.inspect('vbox0').then(function(result){
  console.log(result.Driver.MachineName); //vbox0
});

dm.inspect(['vbox0', 'vbox1']).then(function(map){
  console.log(map['vbox0'].Driver.MachineName); //vbox0
  console.log(map['vbox1'].Driver.MachineName); //vbox1
});
```

##### Stop
```
dm.stop('vbox0').then(function(){
  // Do something
});

dm.stop(['vbox1', 'vbox2']).then(function(){
  // Do something
});
```

##### Stop All
```
dm.stopAll().then(function(){
  // Do something
});
```

##### Start
```
dm.start('vbox0').then(function(){
  // Do something
});

dm.start(['vbox1', 'vbox2']).then(function(){
  // Do something
});
```

##### Start All
```
dm.startAll().then(function(){
  // Do something
});
```

##### Restart
```
dm.restart('vbox0').then(function(){
  // Do something
});

dm.restart(['vbox1', 'vbox2']).then(function(){
  // Do something
});
```

##### Restart All
```
dm.restartAll().then(function(){
  // Do something
});
```

##### Kill
```
dm.kill('vbox0').then(function(){
  // Do something
});

dm.kill(['vbox1', 'vbox2']).then(function(){
  // Do something
});
```

##### Kill All
```
dm.killAll().then(function(){
  // Do something
});
```

##### Status
```
dm.status('vbox0').then(function(status){
  console.log(status === MachineStatus.RUNNING) // true
});

dm.status(['vbox0', 'vbox1']).then(function(map){
  console.log(map['vbox0'] === MachineStatus.RUNNING); //true
  console.log(map['vbox1'] === MachineStatus.STOPPED); //false
});
```

##### All Status
```
dm.statusAll().then(function(map){
  console.log(map['vbox0'] === MachineStatus.RUNNING); //true
  console.log(map['vbox1'] === MachineStatus.STOPPED); //false
  console.log(map['vbox2'] === MachineStatus.RUNNING); //true
  console.log(map['vbox3'] === MachineStatus.RUNNING); //true
});
```

##### IP
```
dm.ip('vbox0').then(function(ip){
  console.log(ip)
});

dm.ip(['vbox0', 'vbox1']).then(function(map){
  console.log(map['vbox0']); //192.168.1.1
  console.log(map['vbox1']); //192.168.1.2
});
```

##### All IP
```
dm.ipAll().then(function(map){
  console.log(map['vbox0']); //192.168.1.1
  console.log(map['vbox1']); //192.168.1.2
  console.log(map['vbox2']); //192.168.1.3
  console.log(map['vbox3']); //192.168.1.4
});
```

##### SSH
```
dm.ssh('vbox0', 'pwd').then(function(result){
  console.log(result); // /home/docker
});

dm.ip(['vbox0', 'vbox1'], 'pwd').then(function(map){
  console.log(map['vbox0']); // /home/docker
  console.log(map['vbox1']); // /home/docker
});
```

##### SCP (Not support multiple machine)
```
// dm.ssh(from, to, options);
dm.ssh('vbox0:/home/docker', '.', {recursive: ''}).then(function(result){
  console.log(result);
});

```
