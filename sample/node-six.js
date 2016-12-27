'use strict'

const NodeDiscovery = require('../index')
const six = new NodeDiscovery()
six
  .set({
    name: 'Six',
    type: 'machine',
    port: 3025
  })
  .broadcast({port: 3024})
  .onNode((data, rinfo) => {
    six.send({
      type: 'hello',
      address: rinfo.address,
      port: rinfo.port,
      text: "Oh, it's hard being a genius."
    })
  })
  .on('ehlo', (message) => {
    six.close()
  })
