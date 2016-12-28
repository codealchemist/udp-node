'use strict'

const expect = require('chai').expect
const UdpNode = require('../index')

// do not output debug logging from the app
const winston = require('winston')
winston.level = 'info'

describe('udp-node', () => {
  it('should create a node', (done) => {
    const node = new UdpNode()
    node.set({name: 'test node'})
    expect(node).not.to.be.undefined
    expect(typeof node.set).to.equal('function')
    expect(typeof node.ping).to.equal('function')
    expect(typeof node.broadcast).to.equal('function')
    expect(typeof node.onNode).to.equal('function')
    expect(typeof node.close).to.equal('function')
    expect(typeof node.on).to.equal('function')
    expect(typeof node.off).to.equal('function')
    expect(typeof node.setLogLevel).to.equal('function')

    node.close(done)
  })

  it('should provide chaining', (done) => {
    const node = new UdpNode()
    expect(node.set({name: 'test node, chaining'})).to.equal(node)
    expect(node.ping({address: '0.0.0.0'})).to.equal(node)
    expect(node.broadcast()).to.equal(node)
    expect(node.onNode()).to.equal(node)

    node.close(done)
  })

  it('should have a guid', () => {
    const node = new UdpNode()
    expect(node.guid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('should broadcast', (done) => {
    const node1 = new UdpNode()
    node1.set({
      name: 'node1',
      type: 'type1'
    })

    const node2 = new UdpNode()
    node2
      .set({
        name: 'node2',
        type: 'type2',
        port: 3025
      })
      .broadcast({
        port: 3024
      })
      .onNode((message, rinfo) => {
        expect(message.address).not.to.be.undefined
        expect(message.from).not.to.be.undefined
        expect(message.port).to.equal(3025)
        expect(message.type).to.equal('pong')
        expect(message.node).to.eql({
          name: 'node1',
          type: 'type1',
          port: 3024,
          broadcastAddress: '255.255.255.255'
        })
        node1.close()
        node2.close()
        done()
      })
  })

  it('should broadcast with filter', (done) => {
    const node1 = new UdpNode()
    node1.set({
      name: 'node1',
      type: 'type1'
    })

    const node2 = new UdpNode()
    node2
      .set({
        name: 'node2',
        type: 'type2',
        port: 3025
      })
      .broadcast({
        filter: ['type1'],
        port: 3024
      })
      .onNode((message, rinfo) => {
        expect(message.address).not.to.be.undefined
        expect(message.from).not.to.be.undefined
        expect(message.port).to.equal(3025)
        expect(message.type).to.equal('pong')
        expect(message.node).to.eql({
          name: 'node1',
          type: 'type1',
          port: 3024,
          broadcastAddress: '255.255.255.255'
        })
        node1.close()
        node2.close()
        done()
      })
  })

  it('should ping', (done) => {
    const node1 = new UdpNode()
    node1.set({
      name: 'node1',
      type: 'type1'
    })

    const node2 = new UdpNode()
    node2
      .set({
        name: 'node2',
        type: 'type2',
        port: 3025
      })
      .broadcast({
        filter: ['type1'],
        port: 3024
      })
      .onNode((broadcastData, broadcastRinfo) => {
        // use address and port from remote node info to ping node
        node2
          .ping({
            address: broadcastRinfo.address,
            port: broadcastRinfo.port
          })
          .onNode((pingData, pingRinfo) => {
            expect(pingData).to.eql(broadcastData)
            node1.close()
            node2.close()
            done()
          })
      })
  })

  it('should send custom messages', (done) => {
    const node1 = new UdpNode()
    node1
      .set({
        name: 'node1',
        type: 'type1'
      })
      .on('hello', (message, rinfo) => {
        expect(message.text).to.equal('hey')
        node1.close()
        node2.close()
        done()
      })

    const node2 = new UdpNode()
    node2
      .set({
        name: 'node2',
        type: 'type2',
        port: 3025
      })
      .send({
        type: 'hello',
        port: 3024,
        text: 'hey'
      })
  })

  it('should turn off all custom message listeners', (done) => {
    const node1 = new UdpNode()
    node1
      .set({
        name: 'node1',
        type: 'type1'
      })

    // add first callback
    node1
      .on('hello', () => {})

    // add second callback, here we will test for both callback to be removed
    node1
      .on('hello', () => {
        node1.off('hello')
        expect(node1.getEvents()['hello']).to.equal(undefined)

        node1.close()
        node2.close()
        done()
      })

    const node2 = new UdpNode()
    node2
      .set({
        name: 'node2',
        type: 'type2',
        port: 3025
      })
      .send({
        type: 'hello',
        port: 3024,
        text: 'hey'
      })
  })

  it('should turn off one custom message listener', (done) => {
    const node1 = new UdpNode()
    node1
      .set({
        name: 'node1',
        type: 'type1'
      })

    const listnerId = node1.on('hello', onHello)
    const node2 = new UdpNode()
    node2
      .set({
        name: 'node2',
        type: 'type2',
        port: 3025
      })
      .send({
        type: 'hello',
        port: 3024,
        text: 'hey'
      })

    function onHello (message, rinfo) {
      node1.off('hello', listnerId)
      expect(node1.getEvents()['hello']).to.eql([])

      node1.close()
      node2.close()
      done()
    }
  })

  it('should set log level', (done) => {
    const node = new UdpNode()
    node.setLogLevel('info')
    node.close()
    done()
  })

  it('should throw an error when using an invalid log level', () => {
    const node = new UdpNode()

    expect(() => {
      node.setLogLevel('Up the irons!')
    }).to.throw('Invalid log level. Use one of: error, warn, info, verbose, debug, silly')

    node.close()
  })

  it('should throw an error when trying to ping without setup', () => {
    const node = new UdpNode()

    expect(() => {
      node.ping({address: '0.0.0.0'}, () => {})
    }).to.throw('Current node was not set up. Set it up using set({...}) before sending messages.')

    node.close()
  })

  it('should throw an error when trying to broadcast without setup', () => {
    const node = new UdpNode()

    expect(() => {
      node.broadcast()
    }).to.throw('Current node was not set up. Set it up using set({...}) before sending messages.')

    node.close()
  })

  it('should throw an error when trying to send custom message without setup', () => {
    const node = new UdpNode()

    expect(() => {
      node.send({})
    }).to.throw('Current node was not set up. Set it up using set({...}) before sending messages.')

    node.close()
  })

  it('should throw an error when trying to ping without address', () => {
    const node = new UdpNode().set({})

    expect(() => {
      node.ping({}, () => {})
    }).to.throw('Required params for ping method: address')

    node.close()
  })
})
