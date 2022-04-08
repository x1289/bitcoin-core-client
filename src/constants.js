
// methods: 
//  key is the method name
//  value is an object with args (optional) and description
//  all arguments are objects
// argument has either arg or opt_arg key and possible values as value

// arguments object (optional):
// type: optional | required
// name: argument name
// default: string (optional)
// valid_values: string (optional)
 
const ARG_TYPE_OPT = 'optional';
const ARG_TYPE_REQ = 'required';

export const RPC = {
  // ---   START BLOCKCHAIN RPCs    ---
  'getbestblockhash': {desc: 'Returns the hash of the best (tip) block in the most-work fully-validated chain.'},
  'getblock': {args: [{type: ARG_TYPE_REQ, name: 'blockhash', valid_values: 'hash'}, {type: ARG_TYPE_OPT, name: 'verbosity', default: 1, valid_values: [0, 1, 2]}], desc: `If verbosity is 0, returns a string that is serialized, hex-encoded data for block 'hash'. \
  If verbosity is 1, returns an Object with information about block 'hash'. \
  If verbosity is 2, returns an Object with information about block 'hash' and information about each transaction.`
  },
  'getblockchaininfo': {desc: 'Returns an object containing various state info regarding blockchain processing.'},
  'getblockcount': {desc: 'Returns the height of the most-work fully-validated chain. The genesis block has height 0.'},
  'getblockfilter': {args: [{type: ARG_TYPE_REQ, name: 'blockhash', valid_values: 'hash'}, {type: ARG_TYPE_OPT, name: 'filtertype', default: 'basic', valid_values: 'string'}], desc: 'Retrieve a BIP 157 content filter for a particular block.'},
  'getblockhash': {args: [{type: ARG_TYPE_REQ, name: 'height', valid_values: 'number'}], desc: 'Returns hash of block in best-block-chain at height provided.'},
  'getblockheader': {},
  'getblockstats': {},
  'getchaintips': {},
  'getchaintxstats': {},
  'getdifficulty': {},
  'getmempoolancestors': {},
  'getmempooldescendants': {},
  'getmempoolentry': {},
  'getmempoolinfo': {},
  'getrawmempool': {},
  'gettxout': {},
  'gettxoutproof': {},
  'gettxoutsetinfo': {},
  'preciousblock': {},
  'pruneblockchain': {},
  'savemempool': {},
  'scantxoutset': {},
  'verifychain': {},
  'verifytxoutproof': {},
  // ---    END BLOCKCHAIN RPCs     ---
  // ---    START CONTROL RPCs      ---
  'getmemoryinfo': {args: [{type: ARG_TYPE_OPT, default: 'stats', valid_values: ['stats', 'mallocinfo']}], desc: 'Returns an object containing information about memory usage.'},
  'getrpcinfo': {desc: 'Returns details of the RPC server.'},
  'help': {desc: 'List all commands, or get help for a specified command.'},
  'logging': {args: [{type: ARG_TYPE_OPT, valid_values: ['net', 'tor', 'mempool', 'http', 'bench', 'zmq', 'walletdb', 'rpc', 'estimatefee', 'addrman', 'selectcoins', 'reindex', 'cmpctblock', 'rand', 'prune', 'proxy', 'mempoolrej', 'libevent', 'coindb', 'qt', 'leveldb', 'validation', 'all', '1', 'none', '0']}, {type: ARG_TYPE_OPT, valid_values: ['net', 'tor', 'mempool', 'http', 'bench', 'zmq', 'walletdb', 'rpc', 'estimatefee', 'addrman', 'selectcoins', 'reindex', 'cmpctblock', 'rand', 'prune', 'proxy', 'mempoolrej', 'libevent', 'coindb', 'qt', 'leveldb', 'validation', 'all', '1', 'none', '0']}], desc: `Gets and sets the logging configuration. \
  When called without an argument, returns the list of categories with status that are currently being debug logged or not. \
  When called with arguments, adds or removes categories from debug logging and return the lists above. \
  The arguments are evaluated in order “include”, “exclude”. \
  If an item is both included and excluded, it will thus end up being excluded. \
  The valid logging categories are: net, tor, mempool, http, bench, zmq, walletdb, rpc, estimatefee, addrman, selectcoins, reindex, cmpctblock, rand, prune, proxy, mempoolrej, libevent, coindb, qt, leveldb, validation In addition, the following are available as category names with special meanings: \
    - “all”, “1” : represent all logging categories \
    - “none”, “0” : even if other logging categories are specified, ignore all of them.`
  },
  'stop': {desc: 'Request a graceful shutdown of Bitcoin Core.'},
  'uptime': {desc: 'Returns the total uptime of the server.'},
  // ---     END CONTROL RPCs       ---
  // ---   START GENERATING RPCs    ---
  'generateblock': {},
  'generatetoaddress': {},
  'generatetodescriptor': {},
  // ---    END GENERATING RPCs     ---
  // ---     START MINING RPCs      ---
  'getblocktemplate': {},
  'getmininginfo': {},
  'getnetworkhashps': {},
  'prioritisetransaction': {},
  'submitblock': {},
  'submitheader': {},
  // ---      END MINING RPCs       ---
  // ---    START NETWORK RPCs      ---
  'addnode': {args: [{type: ARG_TYPE_REQ, name: 'node', valid_values: 'string'}, {type: ARG_TYPE_REQ, name: 'command', valid_values: ['add', 'remove', 'onetry']}], desc: `Attempts to add or remove a node from the addnode list. \
  Or try a connection to a node once. \
  Nodes added using addnode (or -connect) are protected from DoS disconnection and are not required to be full nodes/support SegWit as other outbound peers are (though such peers will not be synced from)`
  },
  'clearbanned': {},
  'disconnectnode': {},
  'getaddednodeinfo': {args: [{type: ARG_TYPE_OPT, name: 'node', default: 'all nodes', valid_values: 'string'}], desc: 'Returns information about the given added node, or all added nodes (note that onetry addnodes are not listed here)'},
  'getconnectioncount': {desc: 'Returns the number of connections to other nodes.'},
  'getnettotals': {desc: 'Returns information about network traffic, including bytes in, bytes out, and current time.'},
  'getnetworkinfo': {desc: 'Returns an object containing various state info regarding P2P networking.'},
  'getnodeaddresses': {args: [{type: ARG_TYPE_OPT, name: 'count', valid_values: 'number'}], desc: 'Return known addresses which can potentially be used to find new nodes in the network'},
  'getpeerinfo': {desc: 'Returns data about each connected network node as a json array of objects.'},
  'listbanned': {desc: 'List all manually banned IPs/Subnets.'},
  'ping': {desc: `Requests that a ping be sent to all other nodes, to measure ping time. \
  Results provided in getpeerinfo, pingtime and pingwait fields are decimal seconds. \
  Ping command is handled in queue with all other commands, so it measures processing backlog, not just network ping.`
  },
  'setban': {args: [{type: ARG_TYPE_REQ, name: 'subnet', valid_values: 'ip/subnet'}, {type: ARG_TYPE_REQ, name: 'command', valid_values: ['add', 'remove']}, {type: ARG_TYPE_OPT, name: 'bantime', default: 0, valid_values: 'number'}, {type: ARG_TYPE_OPT, name: 'absolute', default: false, valid_values: 'boolean'}], desc: 'Attempts to add or remove an IP/Subnet from the banned list.'},
  'setnetworkactive': {args: {type: ARG_TYPE_REQ, name: 'state', valid_values: 'boolean'}, desc: 'Disable/enable all p2p network activity.'},
  // ---     END NETWORK RPCs       ---
  // --- START RAWTRANSACTIONS RPCs ---
  'analyzepsbt': {},
  'combinepsbt': {},
  'combinerawtransaction': {},
  'converttopsbt': {},
  'createpsbt': {},
  'createrawtransaction': {},
  'decodepsbt': {},
  'decoderawtransaction': {},
  'decodescript': {},
  'finalizepsbt': {},
  'fundrawtransaction': {},
  'getrawtransaction': {},
  'joinpsbts': {},
  'sendrawtransaction': {},
  'signrawtransactionwithkey': {},
  'testmempoolaccept': {},
  'utxoupdatepsbt': {},
  // ---  END RAWTRANSACTIONS RPCs  ---
  // ---      START UTIL RPCs       ---
  'createmultisig': {},
  'deriveaddresses': {},
  'estimatesmartfee': {},
  'getdescriptorinfo': {},
  'getindexinfo': {},
  'signmessagewithprivkey': {},
  'validateaddress': {},
  'verifymessage': {},
  // ---       END UTIL RPCs        ---
  // ---     START WALLET RPCs      ---
  'abandontransaction': {},
  'abortrescan': {},
  'addmultisigaddress': {},
  'backupwallet': {},
  'bumpfee': {},
  'createwallet': {},
  'dumpprivkey': {},
  'dumpwallet': {},
  'encryptwallet': {},
  'getaddressesbylabel': {},
  'getaddressinfo': {},
  'getbalance': {},
  'getbalances': {},
  'getnewaddress': {},
  'getrawchangeaddress': {},
  'getreceivedbyaddress': {},
  'getreceivedbylabel': {},
  'gettransaction': {},
  'getunconfirmedbalance': {},
  'getwalletinfo': {},
  'importaddress': {},
  'importdescriptors': {},
  'importmulti': {},
  'importprivkey': {},
  'importprunedfunds': {},
  'importpubkey': {},
  'importwallet': {},
  'keypoolrefill': {},
  'listaddressgroupings': {},
  'listlabels': {},
  'listlockunspent': {},
  'listreceivedbyaddress': {},
  'listreceivedbylabel': {},
  'listsinceblock': {},
  'listtransactions': {},
  'listunspent': {},
  'listwalletdir': {},
  'listwallets': {},
  'loadwallet': {},
  'lockunspent': {},
  'psbtbumpfee': {},
  'removeprunedfunds': {},
  'rescanblockchain': {},
  'send': {},
  'sendmany': {},
  'sendtoaddress': {},
  'sethdseed': {},
  'setlabel': {},
  'settxfee': {},
  'setwalletflag': {},
  'signmessage': {},
  'signrawtransactionwithwallet': {},
  'unloadwallet': {},
  'upgradewallet': {},
  'walletcreatefundedpsbt': {},
  'walletlock': {},
  'walletpassphrase': {},
  'walletpassphrasechange': {},
  'walletprocesspsbt': {}
  // ---      END WALLET RPCs       ---
}

export default {
  RPC
}
