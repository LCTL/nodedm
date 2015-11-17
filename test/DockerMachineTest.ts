import {dm, MachineStatus, Driver, Swarm} from '../index'
import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

console.log ("!!! Warning !!!")
console.log ("!!! This test will remove all existing docker machine and cannot be revert !!!")

describe('DockerMachine', () => {

  describe('#create', () => {

    var vboxDriver: Driver = {
      name: 'virtualbox',
      options: {
        'virtualbox-memory': '512'
      }
    };

    it('should create virtualbox VM and named vbox0, vbox1, vbox2, vbox3', (done) =>
      expect(dm.create(['vbox0', 'vbox1', 'vbox2', 'vbox3'], vboxDriver)).to.eventually
        .deep.equal({
          vbox0: true,
          vbox1: true,
          vbox2: true,
          vbox3: true
        }).notify(done));

  });

  describe('#ls', () => {

    it('should return list of machine',
      (done) => expect(dm.ls())
        .to.eventually.deep.property('[0].name', 'vbox0').notify(done));

  });

  describe('#inspect', () => {

    it('should return vbox0 inspect object',
      (done) => expect(dm.inspect('vbox0'))
        .to.eventually.property('DriverName', 'virtualbox').notify(done));

  });

  describe('#ip', () => {

    it('should return vbox0 ip',
      (done) => expect(dm.ip('vbox0'))
        .to.eventually.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/ig).notify(done));

  });

  describe('#url', () => {

    it('should return vbox0 url',
      (done) => expect(dm.url('vbox0'))
        .to.eventually.match(/^tcp:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+$/ig).notify(done));

  });

  describe('#config', () => {

    it('should return vbox0 config',
      (done) => expect(dm.config('vbox0'))
        .to.eventually.not.empty.notify(done));

  });

  describe('#env', () => {

    it('should return vbox0 env',
      (done) => expect(dm.env('vbox0', {shell: 'cmd'}))
        .to.eventually.not.empty.notify(done));

  });

  describe('#ssh', () => {

    it('should return vbox0 `pwd` result',
      (done) => expect(dm.ssh('vbox0', 'pwd'))
        .to.eventually.equal('/home/docker').notify(done));

  });

  describe('#sshAll', () => {

    it('should return all `pwd` result',
      (done) => expect(dm.sshAll('pwd'))
        .to.eventually.deep.equal({
          vbox0: '/home/docker',
          vbox1: '/home/docker',
          vbox2: '/home/docker',
          vbox3: '/home/docker'
        }).notify(done));

  });

  describe('#upgrade', () => {

    it('should upgrade vbox0',
      (done) => expect(dm.upgrade('vbox0')).to.eventually.equal(true).notify(done));

  });

  describe('#regenerateCert', () => {

    it('should regenerate cert for vbox0',
      (done) => expect(dm.regenerateCert('vbox0')).to.eventually.equal(true).notify(done));

  });

  describe('#stop', () => {

    it('should stop vbox1',
      (done) => expect(dm.stop('vbox1'))
        .to.eventually.equal(true).notify(done));

    it('should stop vbox2',
      (done) => expect(dm.stop('vbox2'))
        .to.eventually.equal(true).notify(done));

    it('should stop vbox3',
      (done) => expect(dm.stop('vbox3'))
        .to.eventually.equal(true).notify(done));

  });

  describe('#remove', () => {

    it('should remove vbox3',
      (done) => expect(dm.rm('vbox3'))
        .to.eventually.equal(true).notify(done));

  });

  describe('#start', () => {

    it('should start vbox2',
      (done) => expect(dm.start('vbox2'))
        .to.eventually.equal(true).notify(done));

  });

  describe('#status', () => {

    it('should return running status when name is vbox0',
      (done) => expect(dm.status('vbox0'))
        .to.eventually.equal(MachineStatus.RUNNING).notify(done));

    it('should return stopped status when name is vbox1',
      (done) => expect(dm.status('vbox1'))
        .to.eventually.equal(MachineStatus.STOPPED).notify(done));

    it('should return running status when name is vbox2',
      (done) => expect(dm.status('vbox2'))
        .to.eventually.equal(MachineStatus.RUNNING).notify(done));

    it('should return not exist status when name is vbox3',
      (done) => expect(dm.status('vbox3'))
        .to.eventually.equal(MachineStatus.NOT_EXIST).notify(done));

    it('should return vbox0, vbox1, vbox2, vbox 3 status',
      (done) => expect(dm.status(['vbox0', 'vbox1', 'vbox2', 'vbox3']))
        .to.eventually.deep.equal({
          vbox0: MachineStatus.RUNNING,
          vbox1: MachineStatus.STOPPED,
          vbox2: MachineStatus.RUNNING,
          vbox3: MachineStatus.NOT_EXIST
        }).notify(done));

  });

  describe('#kill', () => {

    it('should kill vbox0, vbox1, vbox2',
      (done) => expect(dm.kill(['vbox0', 'vbox1', 'vbox2']))
        .to.eventually.deep.equal({
          vbox0: true,
          vbox1: true,
          vbox2: true
        }).notify(done));

  });

  describe('#remove', () => {

    it('should remove vbox0, vbox1, vbox2',
      (done) => expect(dm.rm(['vbox0', 'vbox1', 'vbox2']))
        .to.eventually.deep.equal({
          vbox0: true,
          vbox1: true,
          vbox2: true
        }).notify(done));

  });


  describe('#create swarm', () => {

    var vboxDriver: Driver = {
      name: 'virtualbox',
      options: {
        'virtualbox-memory': '512'
      }
    };
    var swarm: Swarm = {
      master: true,
      discovery: 'token://1234'
    };

    it('should create swarm master and named vbox0', (done) =>
      expect(dm.create('vbox0', vboxDriver, swarm)).to.eventually
        .deep.equal(true).notify(done));

    it('should create swarm slave and named vbox1, vobx2, vbox3', (done) => {
      swarm.master = false;
      expect(dm.create(['vbox1', 'vbox2', 'vbox3'], vboxDriver, swarm)).to.eventually
        .deep.equal({
          vbox1: true,
          vbox2: true,
          vbox3: true
        }).notify(done);
    });

  });

  describe('#list', () => {

    it('should return list and swarm master is vbox0 ',
      (done) => expect(dm.ls())
        .to.eventually.deep.property('[1].swarm', 'vbox0').notify(done));

  });

  describe('#killAll', () => {

    it('should kill all vbox',
      (done) => expect(dm.killAll())
        .to.eventually.deep.equal({
          vbox0: true,
          vbox1: true,
          vbox2: true,
          vbox3: true
        }).notify(done));

  });

  describe('#removeAll', () => {

    it('should remove all vbox',
      (done) => expect(dm.rmAll())
        .to.eventually.deep.equal({
          vbox0: true,
          vbox1: true,
          vbox2: true,
          vbox3: true
        }).notify(done));

  });

});
