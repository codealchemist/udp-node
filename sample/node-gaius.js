'use strict'

const NodeDiscovery = require('../index')
const gaius = new NodeDiscovery()
gaius
  .set({
    name: 'Gaius',
    type: 'original'
  })
  .on('hello', (message, rinfo) => {
    gaius.send({
      type: 'ehlo',
      address: rinfo.address,
      port: rinfo.port,
      text: 'Yes.'
    }, () => {
      gaius.close()
    })
  })
