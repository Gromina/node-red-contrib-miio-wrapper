# Node-RED-contrib-miio-wrapper
This piece of code is intended to use as plugin to [Node red](http://nodered.org)
This plugin has basic support for Xiaomi Mi home devices via [miio library](https://github.com/aholstenson/miio)


## Install

```
npm install node-red-contrib-miio-wrapper
```

## How it works

Config node doesn't have any settings yet. It only discovers devices in a network (same as miio discover).
Than list of devices become available in miio device node.

Miio device node is able to request its properties via 'props' command.
The second option is just to listen for any events emiting from device.
The last option is to call device function by name (which is currrently a hack)

Payload for changePower command:
```javascript
{"command":"call", "name":"changePower", "args":["on"]}
```

Payload for properties request:
```javascript
{"command":"props"}
```



## Usage
Just make 'miio device' from Mii Home section. Then create config node from config dialog.
You have to use same config for all nodes.

## What doesn't work

- zimi.powerstrip.v2 doesn't report its current power state (probably miio bug)
- You cannot use devices with custom tokens (going to implement it later)


## Want to help?

- The best way to help is make pull request with new functions or bug fixes.
- Reporting bugs and (not-)working devices also helps 

## Other interesting links

* [Mi Home protocol reverse enginnering](https://github.com/OpenMiHome/mihome-binary-protocol)
* [Node red node creation docs](https://nodered.org/docs/creating-nodes/)


# Contributors

* Alexander Sorokin (initial author https://github.com/Gromina)
