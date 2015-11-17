var index_1 = require('../index');
var chai = require('chai');
var chai_1 = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
console.log("!!! Warning !!!");
console.log("!!! This test will remove all existing docker machine and cannot be revert !!!");
describe('DockerMachine', function () {
    describe('#create', function () {
        var vboxDriver = {
            name: 'virtualbox',
            options: {
                'virtualbox-memory': '512'
            }
        };
        it('should create virtualbox VM and named vbox0, vbox1, vbox2, vbox3', function (done) {
            return chai_1.expect(index_1.dm.create(['vbox0', 'vbox1', 'vbox2', 'vbox3'], vboxDriver)).to.eventually
                .deep.equal({
                vbox0: true,
                vbox1: true,
                vbox2: true,
                vbox3: true
            }).notify(done);
        });
    });
    describe('#ls', function () {
        it('should return list of machine', function (done) { return chai_1.expect(index_1.dm.ls())
            .to.eventually.deep.property('[0].name', 'vbox0').notify(done); });
    });
    describe('#inspect', function () {
        it('should return vbox0 inspect object', function (done) { return chai_1.expect(index_1.dm.inspect('vbox0'))
            .to.eventually.property('DriverName', 'virtualbox').notify(done); });
    });
    describe('#ip', function () {
        it('should return vbox0 ip', function (done) { return chai_1.expect(index_1.dm.ip('vbox0'))
            .to.eventually.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/ig).notify(done); });
    });
    describe('#url', function () {
        it('should return vbox0 url', function (done) { return chai_1.expect(index_1.dm.url('vbox0'))
            .to.eventually.match(/^tcp:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+$/ig).notify(done); });
    });
    describe('#config', function () {
        it('should return vbox0 config', function (done) { return chai_1.expect(index_1.dm.config('vbox0'))
            .to.eventually.not.empty.notify(done); });
    });
    describe('#env', function () {
        it('should return vbox0 env', function (done) { return chai_1.expect(index_1.dm.env('vbox0', { shell: 'cmd' }))
            .to.eventually.not.empty.notify(done); });
    });
    describe('#ssh', function () {
        it('should return vbox0 `pwd` result', function (done) { return chai_1.expect(index_1.dm.ssh('vbox0', 'pwd'))
            .to.eventually.equal('/home/docker').notify(done); });
    });
    describe('#sshAll', function () {
        it('should return all `pwd` result', function (done) { return chai_1.expect(index_1.dm.sshAll('pwd'))
            .to.eventually.deep.equal({
            vbox0: '/home/docker',
            vbox1: '/home/docker',
            vbox2: '/home/docker',
            vbox3: '/home/docker'
        }).notify(done); });
    });
    describe('#upgrade', function () {
        it('should upgrade vbox0', function (done) { return chai_1.expect(index_1.dm.upgrade('vbox0')).to.eventually.equal(true).notify(done); });
    });
    describe('#regenerateCert', function () {
        it('should regenerate cert for vbox0', function (done) { return chai_1.expect(index_1.dm.regenerateCert('vbox0')).to.eventually.equal(true).notify(done); });
    });
    describe('#stop', function () {
        it('should stop vbox1', function (done) { return chai_1.expect(index_1.dm.stop('vbox1'))
            .to.eventually.equal(true).notify(done); });
        it('should stop vbox2', function (done) { return chai_1.expect(index_1.dm.stop('vbox2'))
            .to.eventually.equal(true).notify(done); });
        it('should stop vbox3', function (done) { return chai_1.expect(index_1.dm.stop('vbox3'))
            .to.eventually.equal(true).notify(done); });
    });
    describe('#remove', function () {
        it('should remove vbox3', function (done) { return chai_1.expect(index_1.dm.rm('vbox3'))
            .to.eventually.equal(true).notify(done); });
    });
    describe('#start', function () {
        it('should start vbox2', function (done) { return chai_1.expect(index_1.dm.start('vbox2'))
            .to.eventually.equal(true).notify(done); });
    });
    describe('#status', function () {
        it('should return running status when name is vbox0', function (done) { return chai_1.expect(index_1.dm.status('vbox0'))
            .to.eventually.equal(index_1.MachineStatus.RUNNING).notify(done); });
        it('should return stopped status when name is vbox1', function (done) { return chai_1.expect(index_1.dm.status('vbox1'))
            .to.eventually.equal(index_1.MachineStatus.STOPPED).notify(done); });
        it('should return running status when name is vbox2', function (done) { return chai_1.expect(index_1.dm.status('vbox2'))
            .to.eventually.equal(index_1.MachineStatus.RUNNING).notify(done); });
        it('should return not exist status when name is vbox3', function (done) { return chai_1.expect(index_1.dm.status('vbox3'))
            .to.eventually.equal(index_1.MachineStatus.NOT_EXIST).notify(done); });
        it('should return vbox0, vbox1, vbox2, vbox 3 status', function (done) { return chai_1.expect(index_1.dm.status(['vbox0', 'vbox1', 'vbox2', 'vbox3']))
            .to.eventually.deep.equal({
            vbox0: index_1.MachineStatus.RUNNING,
            vbox1: index_1.MachineStatus.STOPPED,
            vbox2: index_1.MachineStatus.RUNNING,
            vbox3: index_1.MachineStatus.NOT_EXIST
        }).notify(done); });
    });
    describe('#kill', function () {
        it('should kill vbox0, vbox1, vbox2', function (done) { return chai_1.expect(index_1.dm.kill(['vbox0', 'vbox1', 'vbox2']))
            .to.eventually.deep.equal({
            vbox0: true,
            vbox1: true,
            vbox2: true
        }).notify(done); });
    });
    describe('#remove', function () {
        it('should remove vbox0, vbox1, vbox2', function (done) { return chai_1.expect(index_1.dm.rm(['vbox0', 'vbox1', 'vbox2']))
            .to.eventually.deep.equal({
            vbox0: true,
            vbox1: true,
            vbox2: true
        }).notify(done); });
    });
    describe('#create swarm', function () {
        var vboxDriver = {
            name: 'virtualbox',
            options: {
                'virtualbox-memory': '512'
            }
        };
        var swarm = {
            master: true,
            discovery: 'token://1234'
        };
        it('should create swarm master and named vbox0', function (done) {
            return chai_1.expect(index_1.dm.create('vbox0', vboxDriver, swarm)).to.eventually
                .deep.equal(true).notify(done);
        });
        it('should create swarm slave and named vbox1, vobx2, vbox3', function (done) {
            swarm.master = false;
            chai_1.expect(index_1.dm.create(['vbox1', 'vbox2', 'vbox3'], vboxDriver, swarm)).to.eventually
                .deep.equal({
                vbox1: true,
                vbox2: true,
                vbox3: true
            }).notify(done);
        });
    });
    describe('#list', function () {
        it('should return list and swarm master is vbox0 ', function (done) { return chai_1.expect(index_1.dm.ls())
            .to.eventually.deep.property('[1].swarm', 'vbox0').notify(done); });
    });
    describe('#killAll', function () {
        it('should kill all vbox', function (done) { return chai_1.expect(index_1.dm.killAll())
            .to.eventually.deep.equal({
            vbox0: true,
            vbox1: true,
            vbox2: true,
            vbox3: true
        }).notify(done); });
    });
    describe('#removeAll', function () {
        it('should remove all vbox', function (done) { return chai_1.expect(index_1.dm.rmAll())
            .to.eventually.deep.equal({
            vbox0: true,
            vbox1: true,
            vbox2: true,
            vbox3: true
        }).notify(done); });
    });
});
