import {DockerMachine, MachineStatus, VirtualBoxDriver} from '../index'
import * as chai from 'chai';
import {expect} from 'chai';
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('DockerMachine', () => {

  var dm: DockerMachine = new DockerMachine();

  describe('#create', () => {

    it('should create 4 virtualbox VM and named vbox0, vbox1, vbox2, vbox3',
      (done) => {
        var vboxDriver: VirtualBoxDriver = new VirtualBoxDriver();
        vboxDriver.setOptionValue(VirtualBoxDriver.OPTION_MEMORY.name, "512");
        expect(dm.create(['vbox0', 'vbox1', 'vbox2', 'vbox3'], vboxDriver))
          .to.eventually.deep.equal([true, true, true, true]).notify(done);
      });

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
      (done) => expect(dm.remove('vbox3'))
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

  });

  describe('#killAll', () => {

    it('should kill all vbox',
      (done) => expect(dm.killAll())
        .to.eventually.deep.equal([true, true, true]).notify(done));

  });

  describe('#removeAll', () => {

    it('should remove all vbox',
      (done) => expect(dm.removeAll())
        .to.eventually.deep.equal([true, true, true]).notify(done));

  });

});
