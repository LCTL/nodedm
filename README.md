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
active(): Promise<string>`
config(names: string | string[]): Promise<string | Map<string>>;
create(names: string | string[], driver: Driver, swarm?: Swarm): Promise<boolean | Map<boolean>>;
env(names: string | string[], config?: EnvConfig): Promise<string | Map<string>>;
inspect(names: string | string[]): Promise<any | Map<any>>;
inspectAll(): Promise<Map<any>>;
ip(names: string | string[]): Promise<string | Map<string>>;
ipAll(): Promise<Map<string>>;
kill(names: string | string[]): Promise<boolean | Map<boolean>>;
killAll(): Promise<Map<boolean>>;
ls(nameOnly?: boolean): Promise<Machine[] | string[]>;
regenerateCert(names: string | string[]): Promise<boolean | Map<boolean>>;
regenerateAllCert(): Promise<Map<boolean>>;
restart(names: string | string[]): Promise<boolean | Map<boolean>>;
restartAll(): Promise<Map<boolean>>;
rm(names: string | string[], force?: boolean): Promise<boolean | Map<boolean>>;
rmAll(force?: boolean): Promise<Map<boolean>>;
ssh(names: string | string[], cmd: string): Promise<string | Map<string>>;
sshAll(cmd: string): Promise<Map<string>>;
scp(from: string, to: string, recursive: boolean): Promise<string>;
start(names: string | string[]): Promise<boolean | Map<boolean>>;
startAll(): Promise<Map<boolean>>;
status(names: string | string[]): Promise<string | Map<string>>;
statusAll(): Promise<Map<string>>;
stop(names: string | string[]): Promise<boolean | Map<boolean>>;
stopAll(): Promise<Map<boolean>>;
upgrade(names: string | string[]): Promise<boolean | Map<boolean>>;
upgradeAll(): Promise<Map<boolean>>;
url(names: string | string[]): Promise<string | Map<string>>;
urlAll(): Promise<Map<string>>;
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

##### Create and ls
```
var vboxDriver = {
  name: 'virtualbox',
  options: {
    'virtualbox-memory': '512'
  }
};
dm.create('vbox0', vboxDriver).then(function(){
  // Do something
});
dm.create(['vbox1', 'vbox2', 'vbox3'], vboxDriver).then(function(){
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
// dm.ssh(from, to, recursive);
dm.ssh('vbox0:/home/docker', '.', true).then(function(result){
  console.log(result);
});

```
