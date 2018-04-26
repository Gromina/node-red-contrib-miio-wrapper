module.exports = function(RED) {
    "use strict";
    var {Devices} = require("miio/lib/discovery")
    var miio = require('miio')
    var discovered;
    var PhysDevs = {}

    function MiioWrapperConfig(n) {
        RED.nodes.createNode(this, n);

        this.on('close', function() {
            this.discovered.off('available', this.newDevice);
            this.discovered.off('unavailable', this.deviceGone);
            this.discovered.stop();
        });

        this.newDevice = (device) => {
            PhysDevs[device.id] = device;
        }
        this.deviceGone = (device) => {
            PhysDevs.delete(device.id);
        }

        this.discovered = new Devices({
            cacheTime: 1800, // Default is 1800 seconds (30 minutes)
            skipSubDevices: false,
        });

        this.discovered.on('available', this.newDevice);
        this.discovered.on('unavailable', this.deviceGone);
    }

    RED.nodes.registerType("miio-wrapper-config", MiioWrapperConfig);



    function MiioWrapperDevice(n) {
        RED.nodes.createNode(this, n);
        this.config = RED.nodes.getNode(n.config);
        this.deviceid = n.deviceid;
        this.listenactions = n.listenactions;
        this.dev = null;
        this.timeout = 1000;

        this.actionHandler = (action, data, device)=>{
            var msg = {
                payload:{
                    action: action,
                    data: data
                } }
            this.send(msg)
        }

        this.checkConnection = function(){
            var d = PhysDevs[this.deviceid];
            if(d) {
                if (! this.dev){
                    this.status({shape:'dot',fill:'green', text:d.device.miioModel});
                    this.dev =  PhysDevs[this.deviceid].device;
                    if(this.listenactions){
                        this.dev.onAny(this.actionHandler);
                    }
                }
            }
            else{
                this.dev = null;
                this.status({shape:'dot',fill:'red', text:'reconnect: '+this.timeout});
                setTimeout(()=>{this.checkConnection()}, this.timeout);
                this.timeout = Math.min(5*60*1000, this.timeout*2);
            }
        }

        this.checkConnection()




        this.on('input', function (msg) {
            this.checkConnection()
            try {
                switch (msg.payload.command){
                    case 'props':
                        this.send({
                            payload: {
                                props: this.dev.properties
                            }
                        })
                        break
                    case 'call':
                        //FIXME: get rid of such calls later
                        try{
                            var c = msg.payload.name;
                            var args = msg.payload.args;
                            if (typeof this.dev[c] === "function"){
                                this.dev[c].apply(this.dev, args);
                            }

                        }catch(e){
                            this.send({payload:{error: true, name: c, message: e}})
                        }

                        break
                }
            } catch(err) {
                this.status({fill:"red",shape:"ring",text:err});
                this.error(err)
            }
        });

        this.on("close", function() {
            if (this.dev){
                if(this.listenactions){
                    this.dev.offAny(this.actionHandler)
                }
            }

        });
    }

    RED.nodes.registerType("miio-device", MiioWrapperDevice);

RED.httpAdmin.get("/miiodevs", RED.auth.needsPermission('miio-device.read'), (req,res) => {
        var KnownDevs = Object.keys(PhysDevs).reduce((obj,key) => {
            obj[key] = {
                name: PhysDevs[key].device.miioModel,
                address: PhysDevs[key].device.address,
            }
            return obj;
        }, {});

        res.json(KnownDevs);
    });

}

