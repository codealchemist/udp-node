# udp-node [![Build Status](https://travis-ci.org/codealchemist/udp-node.svg?branch=master)](https://travis-ci.org/codealchemist/udp-node)

Find and communicate with network nodes over UDP.

## About

**udp-node** provides a programatic way of discovering and interacting with other
nodes over UDP. This interaction can be easily achieved using provided methods, 
like `ping`, `broadcast` and `onNode` and you can also create your custom events
using the `on` and `send` methods.

## Install

`npm install --save udp-node`

## Sample

In the `sample` folder you'll find the basics of finding nodes and sending custom messages.
The code is prepared to run on the same machine by changing default port on one node.

## Find all nodes

In this example we will send a *broadcast* message to find all nodes in the network.
These nodes are other instances of **udp-node**.

```
const UdpNode = require('udp-node')
const six = new UdpNode()
six
  .set({
    name: 'Six',
    type: 'machine'
  })
  .broadcast()
  .onNode((message, rinfo) => {
    // FOUND NODE
    // message: contains node's name, type and other details set when node was initialized using set()
    // rinfo: contains node's ip address and port
  })
```

This broadcast message is sent to the default port, 3024.
Nodes listening on that port will automatically answer with a *pong* message.

## Find specific nodes

When a node is created it can set a _type_.
Then, you can send a *broadcast* message filtering by _type_.
Nodes belonging to that _type_ are the only ones who will answer with a *pong*.

```
const UdpNode = require('udp-node')
const six = new UdpNode()
six
  .set({
    name: 'Six',
    type: 'machine'
  })
  .broadcast({
    filter: ['human']
  })
  .onNode((message, rinfo) => {
    // FOUND HUMAN NODE
  })
```

## Properties

### guid

A guid is automatically set for each node when the node is constructed.
This means that it will change each time you do `new UdpNode()`.


## Methods

### set(params)

Initializes **udp-node**.
Must be called to start udp client.

Params object:
- name: string, node's name
- type: string, node's type; used on broadcast filter
- port: int, default is 3024
- broadcastAddress: string, default is 255.255.255.255
- logLevel: calls setLogLevel with passed value

### broadcast(params)

Sends a broadcast message to the network.
Other *udp-nodes* will respond with a *pong* message containing their identity.

Params object:
- filter: array, used to get a pong from specific node types
- port: int, default is 3024
- address: string, default is 255.255.255.255
- data: object, custom data to be included in broadcast message

### ping(params)

Sends a *ping* message to a specific **udp-node**.
If that node is available it will respond with a *pong* message containing its identity.

Params object:
- address: string, required; the address of the node we want to ping; example: 192.168.1.123
- port: int, default is 3024
- data: object, custom data to be included in ping message

### send(message, callback)

Sends a custom message.

`message` properties:
- type: string, required; this is the message type, not to be confused with node's type
- port: int, default is 3024
- address: string, default is 255.255.255.255

After the message is sent passed callback is called.

### onNode(callback)

Called when a node of interest if found, either by a response to our broadcast or ping
or when the other node send us a broadcast or ping.

### on(type, callback)

Adds a listener for a custom message.
When a message of the specified type is recieved calls the passed callback.

**CHANGE** from previous version:

Returns a ref to `this` to allow chaining.

Params:
- type: string, required; any string that identifies the message type
- callback: function, required; called each time a message of specified type is received

### off(type, index)

Turns off individual listeners or all listeners for passed message type when index is not provided.

Params:
- type: string, required; any string that identifies the message type
- index: int, identifies a specific listener

### setLogLevel(level)

**udp-node** uses [Winston](https://github.com/winstonjs/winston) for logging.
Please, refer to [logging levels](https://github.com/winstonjs/winston#logging-levels) on the official documentation for more details.

Params:
- level: string, required; one of: error, warn, info, verbose, debug, silly

### close(callback)

Closes UDP socket.
Should always be called after finished working with the **udp-node** to ensure the socket is closed and the port freed up.
When the socket is closed calls passed callback.

## Notes

If you want to run multiple nodes on the same machine you'll need to provide different ports to each one.
You can easily do this by passing the `port` property when calling `set()` on each node.
