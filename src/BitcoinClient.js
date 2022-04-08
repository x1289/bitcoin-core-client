import http from 'http';
import helper from './helper.js';

export default class BitcoinClient {
  constructor({host, port, user, password}) {
    this.RPC_HOST = host;
    this.RPC_PORT = port;
    this.RPC_USER = user;
    this.RPC_PASSWORD = password;
  }

  /**
   * function to send rpc over the network to the bitcoin node.
   * @param {string} method RPC method to be called
   * @param {Array<any>} args optional arguments for method
   * @returns {Promise<any|Error>} Resulting json response from bitcoin node
   */
   __send(method, args = []) {
    if (!helper.isKnownMethod(method)) return Promise.reject(new Error('unknown method'));
    // TODO: parse args.. if (!helper.isValidArgsForMethod(method, args)) return Promise.reject(new Error(`invalid args for method ${method}`));
    // TODO: generate unique id for request. maybe just count requests and set as increasing integer
    return new Promise((resolve, reject) => {
      const dataBinary = JSON.stringify({"jsonrpc": "1.0", "id": "curltest", "method": method, "params": args}, null, 0);
      const req = http.request({
        auth: `${this.RPC_USER}:${this.RPC_PASSWORD}`,
        host: this.RPC_HOST,
        port: this.RPC_PORT,
        method: 'POST',
        headers: { 'Content-type': 'text/plain' }
      }, (res) => {
        if (res.statusCode > 400 && res.statusCode < 500) {
          reject(new Error(`[Client error] Failed to request method '${method}' with status code '${res.statusCode}'`));
        } else if (res.statusCode > 500 && res.statusCode < 600) {
          reject(new Error(`[Server error] Failed to request method '${method}' with status code '${res.statusCode}'`));
        }
        res.on('data', (chunk) => {
          try {
            const response = JSON.parse(chunk);
            resolve(response.result)
          } catch (error) {
            reject(new Error(`failed to parse response '${chunk}'.`))
          }
        });
      })
      req.write(dataBinary);
      req.end();
    });
  }

  // #region RPC funcions
  // #region Blockchain RPCs
  /**
   * Returns the hash of the best (tip) block in the most-work fully-validated chain.
   * @returns {Promise<string|Error>} the block hash, hex-encoded
   */
  getbestblockhash() { return this.__send('getbestblockhash') }

  /**
   * If verbosity is 0, returns a string that is serialized, hex-encoded data for block ‘hash’.  
   * If verbosity is 1, returns an Object with information about block ‘hash’.  
   * If verbosity is 2, returns an Object with information about block ‘hash’ and information about each transaction.
   * @param {string} blockHash required. The block hash
   * @param {number} verbosity optional. default = 1. 0 for hex-encoded data, 1 for a json object, and 2 for json object with transaction data
   * @returns {Promise<string|object|Error>} A string or object depending on verbosity
   */
  getblock(blockHash, verbosity = 1) { return this.__send('getblock', [blockHash, verbosity]) }

  /**
   * Returns an object containing various state info regarding blockchain processing.
   * @returns {Promise<object|Error>} object containing state info regarding blockchain processing.
   */
  getblockchaininfo() { return this.__send('getblockchaininfo') }

  /**
   * Returns the height of the most-work fully-validated chain. The genesis block has height 0.
   * @returns {Promise<number|Error>} The current block count or an Error
   */
  getblockcount() { return this.__send('getblockcount') }

  /**
   * Retrieve a BIP 157 content filter for a particular block.
   * @param {string} blockHash required. The hash of the block.
   * @param {string} filterType optional. default = basic. The type name of the filter
   * @returns {Promise<object|Error>} filter for particular block.
   */
  getblockfilter(blockHash, filterType) { return this.__send('getblockfilter', [blockHash, filterType]) }

  /**
   * Returns hash of block in best-block-chain at height provided.
   * @param {number} height required. The height index.
   * @returns {Promise<string|Error>} The block hash.
   */
  getblockhash(height) { return this.__send('getblockhash', [height]) }

  /**
   * If verbose is false, returns a string that is serialized, hex-encoded data for blockheader ‘hash’.  
   * If verbose is true, returns an Object with information about blockheader ‘hash’.  
   * @param {string} blockhash required. The block hash.
   * @param {boolean} verbose optional. default = true. true for a json object, false for the hex-encoded data.
   * @returns {Promise<object|string|Error>} An object or string depending on verbosity.
   */
  getblockheader(blockhash, verbose) { return this.__send('getblockheader', [blockhash, verbose]) }

  /**
   * Compute per block statistics for a given window. All amounts are in satoshis.  
   * It won’t work for some heights with pruning.  
   * @param {string|number} hash_or_height required. The block hash or height of the target block.
   * @param {Array<string>} stats optional. Values to plot (see result below).
   * @returns {Promise<object|Error>} object with block statistics.
   */
  getblockstats(hash_or_height, stats) { return this.__send('getblockstats', [hash_or_height, stats]) }

  /**
   * Return information about all known tips in the block tree, including the main chain as well as orphaned branches.
   * @returns {Promise<Array<object>|Error>}
   */
  getchaintips() { return this.__send('getchaintips') }

  /**
   * Compute statistics about the total number and rate of transactions in the chain.
   * @param {number} nblocks optional. default = one month. Size of the window in number of blocks.
   * @param {string} blockhash optional. default = chain tip. The hash of the block that ends the window.
   * @returns {Promise<object|Error>} statistics about the total number and rate of transactions in the chain.
   */
  getchaintxstats(nblocks, blockhash) { return this.__send('getchaintxstats', [nblocks, blockhash]) }

  /**
   * Returns the proof-of-work difficulty as a multiple of the minimum difficulty.
   * @returns {Promise<number|Error>} the proof-of-work difficulty as a multiple of the minimum difficulty.
   */
  getdifficulty() { return this.__send('getdifficulty') }

  /**
   * If txid is in the mempool, returns all in-mempool ancestors.
   * @param {string} txid required. The transaction id (must be in mempool).
   * @param {boolean} verbose optional. default = false. True for a json object, false for array of transaction ids
   * @returns {Promise<Array<string>|Error>}
   */
  getmempoolancestors(txid, verbose = false) { return this.__send('getmempoolancestors', [txid, verbose]) }

  /**
   * If txid is in the mempool, returns all in-mempool descendants.
   * @param {string} txid required. The transaction id (must be in mempool)
   * @param {boolean} verbose optional. default = false. True for a json object, false for array of transaction ids
   * @returns {Promise<object|Array<string>|Error>}
   */
  getmempooldescendants(txid, verbose = false) { return this.__send('getmempooldescendants', [txid, verbose]) }

  /**
   * Returns mempool data for given transaction
   * @param {string} txid required. The transaction id (must be in mempool)
   * @returns {Promise<object|Error>} mempool data for given transaction.
   */
  getmempoolentry(txid) { return this.__send('getmempoolentry', [txid]) }

  /**
   * Returns details on the active state of the TX memory pool.
   * @returns {Promise<object|Error>} details on the active state of the TX memory pool.
   */
  getmempoolinfo() { return this.__send('getmempoolinfo') }

  /**
   * Returns all transaction ids in memory pool as a json array of string transaction ids.  
   * Hint: use getmempoolentry to fetch a specific transaction from the mempool.  
   * @param {boolean} verbose optional. default = false. True for a json object, false for array of transaction ids.
   * @param {boolean} mempool_sequence optional. default = false. If verbose=false, returns a json object with transaction list and mempool sequence number attached.
   * @returns {Promise<Array<string>|object|Error>} all transaction ids in memory pool.
   */
  getrawmempool(verbose = false, mempool_sequence = false) { return this.__send('getrawmempool', [verbose, mempool_sequence]) }

  /**
   * Returns details about an unspent transaction output.
   * @param {string} txid required. The transaction id.
   * @param {number} n required. vout number.
   * @param {boolean} include_mempool optional. default = true. Whether to include the mempool. Note that an unspent output that is spent in the mempool won’t appear.
   * @returns {Promise<object|Error>} details about unspent transaction outputs.
   */
  gettxout(txid, n, include_mempool = true) { return this.__send('gettxout', [txid, n, include_mempool]) }

  /**
   * Returns a hex-encoded proof that “txid” was included in a block.  
   * NOTE: By default this function only works sometimes. This is when there is an unspent output in the utxo for this transaction. To make it always work, you need to maintain a transaction index, using the -txindex command line option or specify the block in which the transaction is included manually (by blockhash).
   * @param {Array<string>} txids required. The txids to filter.
   * @param {string} blockhash optional. If specified, looks for txid in the block with this hash.
   * @returns {Promise<string|Error>} hex-encoded proof that "txid" was included.
   */
  gettxoutproof(txids, blockhash) { return this.__send('gettxoutproof', [txids, blockhash]) }

  /**
   * Returns statistics about the unspent transaction output set.  
   * Note this call may take some time.  
   * @param {string} hash_type optional. default = hash_serialized_2. Which UTXO set hash should be calculated. Options: ‘hash_serialized_2’ (the legacy algorithm), ‘none’.
   * @returns {Promise<object|Error>} statistics about the unspent transaction output set.
   */
  gettxoutsetinfo(hash_type) { return this.__send('gettxoutsetinfo', [hash_type]) }

  /**
   * Treats a block as if it were received before others with the same work.  
   * A later preciousblock call can override the effect of an earlier one.  
   * The effects of preciousblock are not retained across restarts.  
   * @param {string} blockhash required. the hash of the block to mark as precious.
   * @returns {Promise<null|Error>} null
   */
  preciousblock(blockhash) { return this.__send('preciousblock', [blockhash]) }

  /**
   * Prunes the blockchain up to a specified height.
   * @param {number} height required. The block height to prune up to. May be set to a discrete height, or to a UNIX epoch time to prune blocks whose block time is at least 2 hours older than the provided timestamp.
   * @returns {Promise<number|Error>} Height of the last block pruned
   */
  pruneblockchain(height) { return this.__send('pruneblockchain', [height]) }

  /**
   * Dumps the mempool to disk. It will fail until the previous dump is fully loaded.
   * @returns {Promise<null|Error>} null
   */
  savemempool() { return this.__send('savemempool') }

  /**
   * EXPERIMENTAL warning: this call may be removed or changed in future releases.  
   * Scans the unspent transaction output set for entries that match certain output descriptors.  
   * Examples of output descriptors are:  
   * > addr(<address>) Outputs whose scriptPubKey corresponds to the specified address (does not include P2PK) raw(<hex script>) Outputs whose scriptPubKey equals the specified hex scripts combo(<pubkey>) P2PK, P2PKH, P2WPKH, and P2SH-P2WPKH outputs for the given pubkey pkh(<pubkey>) P2PKH outputs for the given pubkey sh(multi(<n>,<pubkey>,<pubkey>,…)) P2SH-multisig outputs for the given threshold and pubkeys.  
   * In the above, <pubkey> either refers to a fixed public key in hexadecimal notation, or to an xpub/xprv optionally followed by one or more path elements separated by “/”, and optionally ending in “/*” (unhardened), or “/*’” or “/*h” (hardened) to specify all unhardened or hardened child keys.  
   * In the latter case, a range needs to be specified by below if different from 1000.  
   * For more information on output descriptors, see the documentation in the doc/descriptors.md file.  
   * @param {string} action required. The action to execute  
   * “start” for starting a scan “abort” for aborting the current scan (returns true when abort was successful) “status” for progress report (in %) of the current scan
   * @param {Array<string|object>} scanobjects  required for “start” action. Array of scan objects. Every scan object is either a string descriptor or an object.
   * @returns {Promise<object|Error>} object with the results of the scan.
   */
  scantxoutset(action, scanobjects) { return this.__send('scantxoutset', [action, scanobjects]) }

  /**
   * Verifies blockchain database.
   * @param {number} checklevel optional. default = 3. range = 0-4. How thorough the block verification is:  
   * - level 0 reads the blocks from disk  
   * - level 1 verifies block validity  
   * - level 2 verifies undo data  
   * - level 3 checks disconnection of tip blocks  
   * - level 4 tries to reconnect the blocks  
   * - each level includes the checks of the previous levels
   * @param {number} nblocks optional. default = 6. 0 = all. The number of blocks to check.
   * @returns {Promise<boolean|Error>} Verified or not
   */
  verifychain(checklevel = 3, nblocks = 6) { return this.__send('verifychain', [checklevel, nblocks]) }

  /**
   * Verifies that a proof points to a transaction in a block, returning the transaction it commits to and throwing an RPC error if the block is not in our best chain.
   * @param {string} proof required. The hex-encoded proof generated by gettxoutproof
   * @returns {Promise<Array<string>|Error>} transactions it commits to
   */
  verifytxoutproof(proof) { return this.__send('verifytxoutproof', [proof]) }

  // #endregion
  // #region Control RPCs

  /**
   * Returns an object containing information about memory usage.
   * @param {string} mode default = "stats"  
   * determines what kind of information is returned.
   * - “stats” returns general statistics about memory usage in the daemon.
   * - “mallocinfo” returns an XML string describing low-level heap state (only available if compiled with glibc 2.10+).
   * @returns {Promise<object|Error>} depends on mode arg.
   */
  getmemoryinfo(mode) { return this.__send('getmemoryinfo', [mode]) }

  /**
   * Returns details of the RPC server.
   * @returns {Promise<object|Error>} details of the RPC server.
   */
  getrpcinfo() { return this.__send('getrpcinfo') }

  /**
   * List all commands, or get help for a specified command.
   * @param {string} command optional, default=all commands. The command to get help on.
   * @returns {Promise<object|Error>} The help text.
   */
  help(command) { return this.__send('help', [command]) }

  /**
   * Gets and sets the logging configuration.  
   * When called without an argument, returns the list of categories with status that are currently being debug logged or not. When called with arguments, adds or removes categories from debug logging and return the lists above. The arguments are evaluated in order “include”, “exclude”. If an item is both included and excluded, it will thus end up being excluded. The valid logging categories are: net, tor, mempool, http, bench, zmq, walletdb, rpc, estimatefee, addrman, selectcoins, reindex, cmpctblock, rand, prune, proxy, mempoolrej, libevent, coindb, qt, leveldb, validation In addition, the following are available as category names with special meanings:  
   * - “all”, “1” : represent all logging categories.  
   * - “none”, “0” : even if other logging categories are specified, ignore all of them.
   * @param {Array<string>} include The categories to add to debug logging.
   * @param {Array<string>} exclude The categories to remove from debug logging.
   * @returns {Promise<object|Error>} keys are logging categories, values indicate its status.
   */
  logging(include, exclude) { return this.__send('logging', [include, exclude]) }

  /**
   * Request a graceful shutdown of Bitcoin Core.
   * @returns {Promise<string|Error>} A string with the content ‘Bitcoin Core stopping’.
   */
  stop() { return this.__send('stop') }

  /**
   * Returns the total uptime of the server.
   * @returns {Promise<number|Error>} The number of seconds that the server has been running.
   */
  uptime() { return this.__send('uptime') }

  // #endregion
  // #region Generating RPCs
  /**
   * Mine a block with a set of ordered transactions immediately to a specified address or descriptor (before the RPC call returns)
   * @param {string} output required. The address or descriptor to send the newly generated bitcoin to.
   * @param {Array<string>} transactions An array of hex strings which are either txids or raw transactions. Txids must reference transactions currently in the mempool. All transactions must be valid and in valid order, otherwise the block will be rejected.
   * @returns {Promise<object|Error>} object with key "hash", value hash of generated block in hex
   */
  generateblock(output, transactions)  { return this.__send('generateblock', [output, transactions]) }

  /**
   * Mine blocks immediately to a specified address (before the RPC call returns)
   * @param {number} nblocks required. How many blocks are generated immediately.
   * @param {string} address required. The address to send the newly generated bitcoin to.
   * @param {number} maxtries optional. default = 1000000. How many iterations to try.
   * @returns {Promise<Array<string>|Error>} hashes of blocks generated
   */
  generatetoaddress(nblocks, address, maxtries) { return this.__send('generatetoaddress', [nblocks, address, maxtries])}

  /**
   * Mine blocks immediately to a specified descriptor (before the RPC call returns)
   * @param {number} num_blocks required. How many blocks are generated immediately.
   * @param {string} descriptor required.The descriptor to send the newly generated bitcoin to.
   * @param {number} maxtries optional. default = 1000000. How many iterations to try.
   * @returns {Promise<Array<string>|Error>} hashes of blocks generated
   */
  generatetodescriptor(num_blocks, descriptor, maxtries) { return this.__send('generatetodescriptor', [num_blocks, descriptor, maxtries])}
  // #endregion
  // #region Mining RPCs
  /**
   * If the request parameters include a ‘mode’ key, that is used to explicitly select between the default ‘template’ request or a ‘proposal’. It returns data needed to construct a block to work on.
   * For full specification, see BIPs 22, 23, 9, and 145:
   * https://github.com/bitcoin/bips/blob/master/bip-0022.mediawiki https://github.com/bitcoin/bips/blob/master/bip-0023.mediawiki https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki#getblocktemplate_changes https://github.com/bitcoin/bips/blob/master/bip-0145.mediawiki
   * @param {object} template_request optional. default = {}. Format of the template. “rules”: [ (json array, required) A list of strings “segwit”, (string, required) (literal) indicates client side segwit support “str”, (string) other client side supported softfork deployment … ], }
   * @returns {Promise<object|Error>}
   */
  getblocktemplate(template_request) { return this.__send('getblocktemplate', [template_request]) }

  /**
   * Returns a json object containing mining-related information.
   * @returns {Promise<object|Error>} mining-related information.
   */
  getmininginfo() { return this.__send('getmininginfo') }

  /**
   * Returns the estimated network hashes per second based on the last n blocks.  
   * Pass in [blocks] to override # of blocks, -1 specifies since last difficulty change.  
   * Pass in [height] to estimate the network speed at the time when a certain block was found.  
   * @param {number} nblocks optional. default = 120. The number of blocks, or -1 for blocks since last difficulty change.
   * @param {number} height optional. default = -1. To estimate at the time of the given height.
   * @returns {Promise<number|Error>} Hashes per second estimated
   */
  getnetworkhashps(nblocks, height) { return this.__send('getnetworkhashps', [nblocks, height]) }

  /**
   * Accepts the transaction into mined blocks at a higher (or lower) priority
   * @param {string} txid required. The transaction id.
   * @param {number} dummy optional. API-Compatibility for previous API. Must be zero or null. DEPRECATED. For forward compatibility use named arguments and omit this parameter.
   * @param {number} fee_delta required. The fee value (in satoshis) to add (or subtract, if negative). Note, that this value is not a fee rate. It is a value to modify absolute fee of the TX. The fee is not actually paid, only the algorithm for selecting transactions into a block considers the transaction as it would have paid a higher (or lower) fee.
   * @returns {Promise<true|Error>}
   */
  prioritisetransaction(txid, dummy, fee_delta) { return this.__send('prioritisetransaction', [txid, dummy, fee_delta]) }

  /**
   * Attempts to submit new block to network.  
   * See https://en.bitcoin.it/wiki/BIP_0022 for full specification.
   * @param {string} hexdata required. The hex-encoded block data to submit
   * @param {string} dummy optional. default = ignored. Dummy value, for compatibility with BIP22. This value is ignored.
   * @returns {Promise<null|string|Error>} Returns null when valid, a string according to BIP22 otherwise
   */
  submitblock(hexdata, dummy) { return this.__send('submitblock', [hexdata, dummy]) }

  /**
   * Decode the given hexdata as a header and submit it as a candidate chain tip if valid.  
   * Throws when the header is invalid.  
   * @param {string} hexdata required. The hex-encoded block header data.
   * @returns {Promise<null|Error>} null
   */
  submitheader(hexdata) { return this.__send('submitheader', [hexdata]) }
  // #endregion
  // #region Network RPCs
  /**
   * Attempts to add or remove a node from the addnode list.  
   * Or try a connection to a node once.  
   * Nodes added using addnode (or -connect) are protected from DoS disconnection and are not required to be full nodes/support SegWit as other outbound peers are (though such peers will not be synced from).
   * @param {string} node required. The node (see getpeerinfo for nodes).
   * @param {string} command required. ‘add’ to add a node to the list, ‘remove’ to remove a node from the list, ‘onetry’ to try a connection to the node once.
   * @returns {Promise<null|Error>} null
   */
  addnode(node, command) { return this.__send('addnode', [node, command]) }

  /**
   * Clear all banned IPs.
   * @returns {Promise<null|Error>} null
   */
  clearbanned() { return this.__send('clearbanned') }

  /**
   * Immediately disconnects from the specified peer node. Strictly one out of ‘address’ and ‘nodeid’ can be provided to identify the node. To disconnect by nodeid, either set ‘address’ to the empty string, or call using the named ‘nodeid’ argument only.
   * @param {string} address optional. default = fallback to nodeid. The IP address/port of the node
   * @param {number} nodeid optional. default = fallback to address. The node ID (see getpeerinfo for node IDs)
   * @returns {Promise<null|Error>} null
   */
  disconnectnode(address, nodeid) { return this.__send('disconnectnode', [address, nodeid]) }

  /**
   * Returns information about the given added node, or all added nodes (note that onetry addnodes are not listed here)
   * @param {string} node optional. default = all nodes. If provided, return information about this specific node, otherwise all nodes are returned.
   * @returns {Promise<Array<object>|Error>}
   */
  getaddednodeinfo(node) { return this.__send('getaddednodeinfo', [node]) }

  /**
   * Returns the number of connections to other nodes.
   * @returns {Promise<number|Error>} The connection count.
   */
  getconnectioncount() { return this.__send('getconnectioncount') }

  /**
   * Returns information about network traffic, including bytes in, bytes out, and current time.
   * @returns {Promise<object|Error>} information about network traffic, including bytes in, bytes out, and current time.
   */
  getnettotals() { return this.__send('getnettotals') }

  /**
   * Returns an object containing various state info regarding P2P networking.
   * @returns {Promise<object|Error>} various state info regarding P2P networking.
   */
  getnetworkinfo() { return this.__send('getnetworkinfo') }

  /**
   * Return known addresses which can potentially be used to find new nodes in the network.
   * @param {number} count optional. default = 1. The maximum number of addresses to return. Specify 0 to return all known addresses.
   * @returns {Promise<Array<object>|Error>}
   */
  getnodeaddresses(count) { return this.__send('getnodeaddresses', [count]) }

  /**
   * Returns data about each connected network node as a json array of objects.
   * @returns {Promise<Array<object>|Error>} Array of objects with data about every connected node.
   */
  getpeerinfo() { return this.__send('getpeerinfo') }

  /**
   * List all manually banned IPs/Subnets.
   * @returns {Promise<Array<object>>} Array of banned IPs/Subnets.
   */
  listbanned() { return this.__send('listbanned') }

  /**
   * Requests that a ping be sent to all other nodes, to measure ping time. Results provided in getpeerinfo, pingtime and pingwait fields are decimal seconds. Ping command is handled in queue with all other commands, so it measures processing backlog, not just network ping.
   * @returns {Promise<null|Error>}
   */
  ping() { return this.__send('ping') }

  /**
   * Attempts to add or remove an IP/Subnet from the banned list.
   * @param {string} subnet required. The IP/Subnet (see getpeerinfo for nodes IP) with an optional netmask (default is /32 = single IP).
   * @param {string} command required. ‘add’ to add an IP/Subnet to the list, ‘remove’ to remove an IP/Subnet from the list.
   * @param {number} bantime optional. default = 0. time in seconds how long (or until when if [absolute] is set) the IP is banned (0 or empty means using the default time of 24h which can also be overwritten by the -bantime startup argument).
   * @param {boolean} absolute optional. default = false. If set, the bantime must be an absolute timestamp expressed in UNIX epoch time.
   * @returns {Promise<null|Error>}
   */
  setban(subnet, command, bantime, absolute) { return this.__send('setban', [subnet, command, bantime, absolute]) }

  /**
   * Disable/enable all p2p network activity.
   * @param {boolean} state required. true to enable networking, false to disable.
   * @returns {Promise<boolean|Error>} The value that was passed in.
   */
  setnetworkactive(state) { return this.__send('setnetworkactive', [state]) }
  
  // #endregion
  // #region Rawtransactions RPCs
  /**
   * Analyzes and provides information about the current status of a PSBT and its inputs.
   * @param {string} psbt required. A base64 string of a PSBT.
   * @returns {Promise<object|Error>} information about the current status of a PSBT and its inputs.
   */
  analyzepsbt(psbt) { return this.__send('analyzepsbt', [psbt]) }

  /**
   * Combine multiple partially signed Bitcoin transactions into one transaction.  
   * Implements the Combiner role.  
   * @param {Array<string>} tsx required. The base64 strings of partially signed transactions.
   * @returns {Promise<string|Error>} The base64-encoded partially signed transaction.
   */
  combinepsbt(tsx) { return this.__send('combinepsbt', [tsx]) }

  /**
   * Combine multiple partially signed transactions into one transaction.  
   * The combined transaction may be another partially signed transaction or a fully signed transaction.  
   * @param {Array<string>} txs required. The hex strings of partially signed transactions.
   * @returns {Promise<string|Error>} The hex-encoded raw transaction with signature(s)
   */
  combinerawtransaction(txs) { return this.__send('combinerawtransaction', [txs]) }

  /**
   * Converts a network serialized transaction to a PSBT. This should be used only with createrawtransaction and fundrawtransaction createpsbt and walletcreatefundedpsbt should be used for new applications.
   * @param {string} hexstring required. The hex string of a raw transaction
   * @param {boolean} permitsigdata optional. default = false. If true, any signatures in the input will be discarded and conversion will continue. If false, RPC will fail if any signatures are present.
   * @param {boolean} iswitness optional. default = depends on heuristic tests. Whether the transaction hex is a serialized witness transaction. If iswitness is not present, heuristic tests will be used in decoding. If true, only witness deserialization will be tried. If false, only non-witness deserialization will be tried. This boolean should reflect whether the transaction has inputs (e.g. fully valid, or on-chain transactions), if known by the caller. 
   * @returns {Promise<string|Error>} The resulting raw transaction (base64-encoded string)
   */
  converttopsbt(hexstring, permitsigdata = false, iswitness) { return this.__send('converttopsbt', [hexstring, permitsigdata, iswitness]) }

  /**
   * Creates a transaction in the Partially Signed Transaction format.  
   * Implements the Creator role.  
   * @param {Array<object>} inputs required. The json objects
   * @param {Array<object>} outputs required. The outputs (key-value pairs), where none of the keys are duplicated. That is, each address can only appear once and there can only be one ‘data’ object. For compatibility reasons, a dictionary, which holds the key-value pairs directly, is also accepted as second parameter.
   * @param {number} locktime optional. default = 0. Raw locktime. Non-0 value also locktime-activates inputs
   * @param {boolean} replaceable optional. default = false. Marks this transaction as BIP125 replaceable. Allows this transaction to be replaced by a transaction with higher fees. If provided, it is an error if explicit sequence numbers are incompatible.
   * @returns {Promise<string|Error>} The resulting raw transaction (base64-encoded string)
   */
  createpsbt(inputs, outputs, locktime = 0, replaceable = false) { return this.__send('createpsbt', [inputs, outputs, locktime, replaceable]) }

  /**
   * Create a transaction spending the given inputs and creating new outputs.  
   * Outputs can be addresses or data.  
   * Returns hex-encoded raw transaction.  
   * Note that the transaction’s inputs are not signed, and it is not stored in the wallet or transmitted to the network.
   * @param {Array<object>} inputs required. The inputs.
   * @param {Array<object>} outputs required. The outputs (key-value pairs), where none of the keys are duplicated. That is, each address can only appear once and there can only be one ‘data’ object. For compatibility reasons, a dictionary, which holds the key-value pairs directly, is also accepted as second parameter.
   * @param {number} locktime optional. default = 0. Raw locktime. Non-0 value also locktime-activates inputs
   * @param {boolean} replaceable optional. default = false. Marks this transaction as BIP125-replaceable. Allows this transaction to be replaced by a transaction with higher fees. If provided, it is an error if explicit sequence numbers are incompatible.
   * @returns {Promise<string|Error>} hex string of the transaction
   */
  createrawtransaction(inputs, outputs, locktime = 0, replaceable) { return this.__send('createrawtransaction', [inputs, outputs, locktime, replaceable]) }

  /**
   * Return a JSON object representing the serialized, base64-encoded partially signed Bitcoin transaction.
   * @param {string} psbt required. The PSBT base64 string.
   * @returns {Promise<object|Error>} serialized, base64-encoded partially signed Bitcoin transaction.
   */
  decodepsbt(psbt) { return this.__send('decodepsbt', [psbt]) }

  /**
   * Return a JSON object representing the serialized, hex-encoded transaction.
   * @param {string} hexstring required. The transaction hex string
   * @param {boolean} iswitness optional. default = depends on heuristic tests. Whether the transaction hex is a serialized witness transaction. If iswitness is not present, heuristic tests will be used in decoding. If true, only witness deserialization will be tried. If false, only non-witness deserialization will be tried. This boolean should reflect whether the transaction has inputs (e.g. fully valid, or on-chain transactions), if known by the caller.
   * @returns {Promise<object|Error>}
   */
  decoderawtransaction(hexstring, iswitness) { return this.__send('decoderawtransaction', [hexstring, iswitness]) }

  /**
   * Decode a hex-encoded script.
   * @param {string} hexstring required. The hex-encoded script
   * @returns {Promise<object|Error>} object with decoded information.
   */
  decodescript(hexstring) { return this.__send('decodescript', [hexstring]) }

  /**
   * Finalize the inputs of a PSBT. If the transaction is fully signed, it will produce a network serialized transaction which can be broadcast with sendrawtransaction. Otherwise a PSBT will be created which has the final_scriptSig and final_scriptWitness fields filled for inputs that are complete. Implements the Finalizer and Extractor roles.
   * @param {string} psbt required. A base64 string of a PSBT.
   * @param {boolean} extract optional. default = true. If true and the transaction is complete, extract and return the complete transaction in normal network serialization instead of the PSBT.
   * @returns {Promise<object|Error>} object with PSBT.
   */
  finalizepsbt(psbt, extract = true) { return this.__send('finalizepsbt', [psbt, extract]) }

  /**
   * If the transaction has no inputs, they will be automatically selected to meet its out value. It will add at most one change output to the outputs. No existing outputs will be modified unless “subtractFeeFromOutputs” is specified. Note that inputs which were signed may need to be resigned after completion since in/outputs have been added. The inputs added will not be signed, use signrawtransactionwithkey or signrawtransactionwithwallet for that. Note that all existing inputs must have their previous output transaction be in the wallet. Note that all inputs selected must be of standard form and P2SH scripts must be in the wallet using importaddress or addmultisigaddress (to calculate fees). You can see whether this is the case by checking the “solvable” field in the listunspent output. Only pay-to-pubkey, multisig, and P2SH versions thereof are currently supported for watch-only
   * @param {string} hexstring required. The hex string of the raw transaction.
   * @param {object} options optional. for backward compatibility: passing in a true instead of an object will result in {“includeWatching”:true} “replaceable”: bool, (boolean, optional, default=wallet default) Marks this transaction as BIP125 replaceable. Allows this transaction to be replaced by a transaction with higher fees “conf_target”: n, (numeric, optional, default=wallet -txconfirmtarget) Confirmation target in blocks “estimate_mode”: “str”, (string, optional, default=unset) The fee estimate mode, must be one of (case insensitive): “unset” “economical” “conservative” }
   * @param {boolean} iswitness optional. default = depends on heuristic tests. Whether the transaction hex is a serialized witness transaction. If iswitness is not present, heuristic tests will be used in decoding. If true, only witness deserialization will be tried. If false, only non-witness deserialization will be tried. This boolean should reflect whether the transaction has inputs (e.g. fully valid, or on-chain transactions), if known by the caller.
   * @returns {Promise<object|Error>} object with resulting raw transaction and fee.
   */
  fundrawtransaction(hexstring, options, iswitness) { return this.__send('fundrawtransaction', [hexstring, options, iswitness]) }

  /**
   * Return the raw transaction data.  
   * By default this function only works for mempool transactions. When called with a blockhash argument, getrawtransaction will return the transaction if the specified block is available and the transaction is found in that block. When called without a blockhash argument, getrawtransaction will return the transaction if it is in the mempool, or if -txindex is enabled and the transaction is in a block in the blockchain.  
   * Hint: Use gettransaction for wallet transactions.  
   * If verbose is ‘true’, returns an Object with information about ‘txid’.  
   * If verbose is ‘false’ or omitted, returns a string that is serialized, hex-encoded data for ‘txid’.
   * @param {string} txid required. The transaction id.
   * @param {boolean} verbose optional. default = false. If false, return a string, otherwise return a json object.
   * @param {string} blockhash optional. The block in which to look for the transaction.
   * @returns {Promise<string|Error>} The serialized, hex-encoded data for ‘txid’
   */
  getrawtransaction(txid, verbose = false, blockhash) { return this.__send('getrawtransaction', [txid, verbose, blockhash]) }

  /**
   * Joins multiple distinct PSBTs with different inputs and outputs into one PSBT with inputs and outputs from all of the PSBTs No input in any of the PSBTs can be in more than one of the PSBTs.
   * @param {Array<string>} txs required. The base64 strings of partially signed transactions.
   * @returns {Promise<string|Error>} The base64-encoded partially signed transaction.
   */
  joinpsbts(txs) { return this.__send('joinpsbts', [txs]) }

  /**
   * Submit a raw transaction (serialized, hex-encoded) to local node and network.  
   * Note that the transaction will be sent unconditionally to all peers, so using this for manual rebroadcast may degrade privacy by leaking the transaction’s origin, as nodes will normally not rebroadcast non-wallet transactions already in their mempool.  
   * Also see createrawtransaction and signrawtransactionwithkey calls.  
   * @param {string} hexstring required. The hex string of the raw transaction.
   * @param {number|string} maxfeerate optional. default = 0.10. Reject transactions whose fee rate is higher than the specified value, expressed in BTC/kB. Set to 0 to accept any fee rate.
   * @returns {Promise<string|Error>} The transaction hash in hex.
   */
  sendrawtransaction(hexstring, maxfeerate = 0.10) { return this.__send('sendrawtransaction', [hexstring, maxfeerate]) }

  /**
   * Sign inputs for raw transaction (serialized, hex-encoded). The second argument is an array of base58-encoded private keys that will be the only keys used to sign the transaction. The third optional argument (may be null) is an array of previous transaction outputs that this transaction depends on but may not yet be in the block chain.
   * @param {string} hexstring required. The transaction hex string.
   * @param {Array<string>} privatekeysm required. The base58-encoded private keys for signing
   * @param {Array<object>} prevtxs optional. The previous dependent transaction outputs
   * @param {string} sighashtype optional, default = ALL. The signature hash type. Must be one of: “ALL” “NONE” “SINGLE” “ALL|ANYONECANPAY” “NONE|ANYONECANPAY” “SINGLE|ANYONECANPAY”
   * @returns {Promise<object|Error>} object with the hex-encoded raw transaction with signature(s).
   */
  signrawtransactionwithkey(hexstring, privatekeysm, prevtxs, sighashtype = "ALL") { return this.__send('signrawtransactionwithkey', [hexstring, privatekeysm, prevtxs, sighashtype]) }

  /**
   * Returns result of mempool acceptance tests indicating if raw transaction (serialized, hex-encoded) would be accepted by mempool. This checks if the transaction violates the consensus or policy rules. See sendrawtransaction call.
   * @param {Array<string>} rawtxs required. An array of hex strings of raw transactions. Length must be one for now.
   * @param {number|string} maxfeerate optional. default = 0.10. Reject transactions whose fee rate is higher than the specified value, expressed in BTC/kB
   * @returns {Promise<Array<object>|Error>} result of mempool acceptance tests.
   */
  testmempoolaccept(rawtxs, maxfeerate = 0.10) { return this.__send('testmempoolaccept', [rawtxs, maxfeerate]) }

  /**
   * Updates all segwit inputs and outputs in a PSBT with data from output descriptors, the UTXO set or the mempool.
   * @param {string} psbt required. A base64 string of a PSBT.
   * @param {Array<string|object>} descriotors optional. An array of either strings or objects.
   * @returns {Promise<string|Error>} The base64-encoded partially signed transaction with inputs updated
   */
  utxoupdatepsbt(psbt, descriotors) { return this.__send('utxoupdatepsbt', [psbt, descriotors]) }

  // #endregion
  // #region Util RPCs
  /**
   * Creates a multi-signature address with n signature of m keys required.  
   * It returns a json object with the address and redeemScript.  
   * @param {number} nrequired required. The number of required signatures out of the n keys.
   * @param {Array<string>} keys required. The hex-encoded public keys.
   * @param {string} address_type optional. default = "legacy". The address type to use. Options are “legacy”, “p2sh-segwit”, and “bech32”.
   * @returns {Promise<object|Error>} object with the address and redeemScript.
   */
  createmultisig(nrequired, keys, address_type = "legacy") { return this.__send('createmultisig', [nrequired, keys, address_type]) }

  /**
   * Derives one or more addresses corresponding to an output descriptor.  
   * Examples of output descriptors are:  
   * - pkh(<pubkey>) P2PKH outputs for the given pubkey wpkh(<pubkey>) Native segwit P2PKH outputs for the given pubkey sh(multi(<n>,<pubkey>,<pubkey>,…)) P2SH-multisig outputs for the given threshold and pubkeys raw(<hex script>) Outputs whose scriptPubKey equals the specified hex scripts  
   * In the above, <pubkey> either refers to a fixed public key in hexadecimal notation, or to an xpub/xprv optionally followed by one or more path elements separated by “/”, where “h” represents a hardened child key.  
   * For more information on output descriptors, see the documentation in the doc/descriptors.md file.  
   * @param {string} descriptor required. The descriptor.
   * @param {number|Array<number>} range optional. If a ranged descriptor is used, this specifies the end or the range (in [begin,end] notation) to derive.
   * @returns {Promise<Array<string>|Error>} Array of derived addresses
   */
  deriveaddresses(descriptor, range) { return this.__send('deriveaddresses', [descriptor, range]) }

  /**
   * Estimates the approximate fee per kilobyte needed for a transaction to begin confirmation within conf_target blocks if possible and return the number of blocks for which the estimate is valid. Uses virtual transaction size as defined in BIP 141 (witness data is discounted).
   * @param {number} conf_target required. Confirmation target in blocks (1 - 1008). 
   * @param {string} estimate_mode optional. default = "CONSERVATIVE". The fee estimate mode. Whether to return a more conservative estimate which also satisfies a longer history. A conservative estimate potentially returns a higher feerate and is more likely to be sufficient for the desired target, but is not as responsive to short term drops in the prevailing fee market. Must be one of: “UNSET” “ECONOMICAL” “CONSERVATIVE”
   * @returns {Promise<object|Error>} object with estimated fee rate.
   */
  estimatesmartfee(conf_target, estimate_mode) { return this.__send('estimatesmartfee', [conf_target, estimate_mode]) }

  /**
   * Analyses a descriptor.
   * @param {*} descriptor required. The descriptor.
   * @returns {Promise<object|Error>} object with information about the descriptor.
   */
  getdescriptorinfo(descriptor) { return this.__send('getdescriptorinfo', [descriptor]) }

  /**
   * Returns the status of one or all available indices currently running in the node.
   * @param {string} index_name optional. Filter results for an index with a specific name.
   * @returns {Promise<object|Error>} object with the status of one or all available indices currently running in the node.
   */
  getindexinfo(index_name) { return this.__send('getindexinfo', [index_name]) }

  /**
   * Sign a message with the private key of an address.
   * @param {string} privkey required. The private key to sign the message with.
   * @param {string} message required. The message to create a signature of.
   * @returns {Promise<string|Error>} The signature of the message encoded in base 64.
   */
  signmessagewithprivkey(privkey, message) { return this.__send('signmessagewithprivkey', [privkey, message]) }

  /**
   * Return information about the given bitcoin address.
   * @param {string} address required. The bitcoin address to validate.
   * @returns {Promise<object|Error>} object with information about the address.
   */
  validateaddress(address) { return this.__send('validateaddress', [address]) }

  /**
   * Verify a signed message.
   * @param {*} address required. The bitcoin address to use for the signature.
   * @param {*} signature required. The signature provided by the signer in base 64 encoding (see signmessage).
   * @param {*} message required. The message that was signed.
   * @returns {Promise<boolean|Error>} If the signature is verified or not.
   */
  verifymessage(address, signature, message) { return this.__send('verifymessage', [address, signature, message]) }

  // #endregion
  // #region TODO: Wallet RPCs
  // Note: the wallet RPCs are only available if Bitcoin Core was built with wallet support, which is the default.

  /**
   * Mark in-wallet transaction <txid> as abandoned This will mark this transaction and all its in-wallet descendants as abandoned which will allow for their inputs to be respent. It can be used to replace “stuck” or evicted transactions.  
   * It only works on transactions which are not included in a block and are not currently in the mempool.  
   * It has no effect on transactions which are already abandoned.  
   * @param {string} txid required. The transaction id.
   * @returns {Promise<null|Error>} null
   */
  abandontransaction(txid) { return this.__send('abandontransaction', [txid]) }

  /**
   * Stops current wallet rescan triggered by an RPC call, e.g. by an importprivkey call.  
   * Note: Use “getwalletinfo” to query the scanning progress.  
   * @returns {Promise<boolean|Error>} Whether the abort was successful.
   */
  abortrescan() { return this.__send('abortrescan') }

  /**
   * Add an nrequired-to-sign multisignature address to the wallet. Requires a new wallet backup.  
   * Each key is a Bitcoin address or hex-encoded public key.  
   * This functionality is only intended for use with non-watchonly addresses.  
   * See importaddress for watchonly p2sh address support.  
   * If ‘label’ is specified, assign address to that label.  
   * @param {number} nrequired required. The number of required signatures out of the n keys or addresses.
   * @param {Array<string>} keys required. The bitcoin addresses or hex-encoded public keys.
   * @param {string} label optional. A label to assign the addresses to.
   * @param {string} address_type optional. default = set by -addresstype. The address type to use. Options are “legacy”, “p2sh-segwit”, and “bech32”.
   * @returns {Promise<object|Error>} object with valie of new multisig address.
   */
  addmultisigaddress(nrequired, keys, label, address_type) { return this.__send('addmultisigaddress', [nrequired, keys, label, address_type]) }

  /**
   * Safely copies current wallet file to destination, which can be a directory or a path with filename.
   * @param {string} destination required. The destination directory or file.
   * @returns {Promise<null|Error>} null
   */
  backupwallet(destination) { return this.__send('backupwallet', [destination]) }

  /**
   * Bumps the fee of an opt-in-RBF transaction T, replacing it with a new transaction B.  
   * An opt-in RBF transaction with the given txid must be in the wallet.  
   * The command will pay the additional fee by reducing change outputs or adding inputs when necessary.  
   * It may add a new change output if one does not already exist.  
   * All inputs in the original transaction will be included in the replacement transaction.  
   * The command will fail if the wallet or mempool contains a transaction that spends one of T’s outputs.  
   * By default, the new fee will be calculated automatically using the estimatesmartfee RPC.  
   * The user can specify a confirmation target for estimatesmartfee.  
   * Alternatively, the user can specify a fee rate in sat/vB for the new transaction.  
   * At a minimum, the new fee rate must be high enough to pay an additional new relay fee (incrementalfee returned by getnetworkinfo) to enter the node’s mempool.  
   * * WARNING: before version 0.21, fee_rate was in BTC/kvB. As of 0.21, fee_rate is in sat/vB. *  
   * @param {string} txid required. The txid to be bumped.
   * @param {object} options optional. options object.
   * @returns {Promise<object|Error>} object with base64-encoded unsigned PSBT.
   */
  bumpfee(txid, options) { return this.__send('bumpfee', [txid, options]) }

  /**
   * Creates and loads a new wallet.
   * @param {string} wallet_name required. The name for the new wallet. If this is a path, the wallet will be created at the path location.
   * @param {boolean} disable_private_keys optional. default = false. Disable the possibility of private keys (only watchonlys are possible in this mode).
   * @param {boolean} blank optional. default = false. Create a blank wallet. A blank wallet has no keys or HD seed. One can be set using sethdseed.
   * @param {string} passphrase required. Encrypt the wallet with this passphrase.
   * @param {boolean} avoid_reuse optional. default = false. Keep track of coin reuse, and treat dirty and clean coins differently with privacy considerations in mind.
   * @param {boolean} descriptor optional. default = false. Create a native descriptor wallet. The wallet will use descriptors internally to handle address creation.
   * @param {boolean} load_on_startup optional. default = null. Save wallet name to persistent settings and load on startup. True to add wallet to startup list, false to remove, null to leave unchanged.
   * @returns {Promise<object|Error>} object with wallet name and warning
   */
  createwallet(wallet_name, disable_private_keys = false, blank = false, passphrase, avoid_reuse = false, descriptor = false, load_on_startup) { return this.__send('createwallet', [wallet_name, disable_private_keys, blank, passphrase, avoid_reuse, descriptor, load_on_startup]) }

  /**
   * Reveals the private key corresponding to ‘address’.  
   * Then the importprivkey can be used with this output  
   * @param {string} address required. The bitcoin address for the private key.
   * @returns {Promise<string|Error>} The private key.
   */
  dumpprivkey(address) { return this.__send('dumpprivkey', [address]) }

  /**
   * Dumps all wallet keys in a human-readable format to a server-side file. This does not allow overwriting existing files.  
   * Imported scripts are included in the dumpfile, but corresponding BIP173 addresses, etc. may not be added automatically by importwallet.  
   * Note that if your wallet contains keys which are not derived from your HD seed (e.g. imported keys), these are not covered by only backing up the seed itself, and must be backed up too (e.g. ensure you back up the whole dumpfile).  
   * @param {string} filename required. The filename with path (absolute path recommended).
   * @returns {Promise<object|Error>} object with filename (full absolute path)
   */
  dumpwallet(filename) { return this.__send('dumpwallet', [filename]) }

  /**
   * Encrypts the wallet with ‘passphrase’. This is for first time encryption.  
   * After this, any calls that interact with private keys such as sending or signing will require the passphrase to be set prior the making these calls.  
   * Use the walletpassphrase call for this, and then walletlock call.  
   * If the wallet is already encrypted, use the walletpassphrasechange call.  
   * @param {string} passphrase required. The pass phrase to encrypt the wallet with. It must be at least 1 character, but should be long.
   * @returns {Promsie<string|Error>} A string with further instructions.
   */
  encryptwallet(passphrase) { return this.__send('encryptwallet', [passphrase]) }

  /**
   * Returns the list of addresses assigned the specified label.
   * @param {string} label required. The label.
   * @returns {Promise<object|Error>} object with addresses as keys.
   */
  getaddressesbylabel(label) { return this.__send('getaddressesbylabel', [label]) }

  /**
   * Return information about the given bitcoin address. Some of the information will only be present if the address is in the active wallet.
   * @param {string} address required. The bitcoin address for which to get information.
   * @returns {Promise<object|Error>} object with information about the given bitcoin address.
   */
  getaddressinfo(address) { return this.__send('getaddressinfo', [address]) }

  /**
   * Returns the total available balance.  
   * The available balance is what the wallet considers currently spendable, and is thus affected by options which limit spendability such as -spendzeroconfchange.  
   * @param {string} dummy optional. Remains for backward compatibility. Must be excluded or set to “*”.
   * @param {number} minconf optional. default = 0. Only include transactions confirmed at least this many times.
   * @param {boolean} include_watchonly optional. default = true for watch-only wallets, otherwise false. Also include balance in watch-only addresses (see ‘importaddress’)
   * @param {booelan} avoid_reuse optional. default = true. (only available if avoid_reuse wallet flag is set) Do not include balance in dirty outputs; addresses are considered dirty if they have previously been used in a transaction.
   * @returns {Promise<number|Error>} The total amount in BTC received for this wallet.
   */
  getbalance(dummy, minconf = 0, include_watchonly = true, avoid_reuse = true) { return this.__send('getbalance', [dummy, minconf, include_watchonly, avoid_reuse]) }

  /**
   * Returns an object with all balances in BTC.
   * @returns {Promise<object|Error>} object with all balances in BTC.
   */
  getbalances() { return this.__send('getbalances') }

  /**
   * Returns a new Bitcoin address for receiving payments.  
   * If ‘label’ is specified, it is added to the address book so payments received with the address will be associated with ‘label’.  
   * @param {string} label optional. default = "". The label name for the address to be linked to. It can also be set to the empty string “” to represent the default label. The label does not need to exist, it will be created if there is no label by the given name.
   * @param {string} address_type optional. default = set by -addresstype. The address type to use. Options are “legacy”, “p2sh-segwit”, and “bech32”.
   * @returns {Promise<string|Error>} The new bitcoin address.
   */
  getnewaddress(label, address_type) { return this.__send('getnewaddress', [label, address_type]) }

  /**
   * Returns a new Bitcoin address, for receiving change.  
   * This is for use with raw transactions, NOT normal use.  
   * @param {string} address_type optional. default = set by -changetype. The address type to use. Options are “legacy”, “p2sh-segwit”, and “bech32”.
   * @returns {Promise<string|Error>} The address
   */
  getrawchangeaddress(address_type) { return this.__send('getrawchangeaddress', [address_type]) }

  /**
   * Returns the total amount received by the given address in transactions with at least minconf confirmations.
   * @param {string} address required. The bitcoin address for transactions.
   * @param {number} minconf optional. default = 1
   * @returns {Promise<number|Error>} The total amount in BTC received at this address.
   */
  getreceivedbyaddress(address, minconf = 1) { return this.__send('getreceivedbyaddress', [address, minconf]) }

  /**
   * Returns the total amount received by addresses with <label> in transactions with at least [minconf] confirmations.
   * @param {string} label required. The selected label, may be the default label using “”.
   * @param {number} minconf optional. default = 1. Only include transactions confirmed at least this many times.
   * @returns {Promise<number|Error>} The total amount in BTC received for this label.
   */
  getreceivedbylabel(label, minconf) { return this.__send('getreceivedbylabel', [label, minconf]) }

  /**
   * Get detailed information about in-wallet transaction <txid>.
   * @param {string} txid required. The transaction id.
   * @param {boolean} include_watchonly optional. default = true for watch-only wallets, otherwise false. Whether to include watch-only addresses in balance calculation and details[].
   * @param {boolean} verbose optional. default = false. Whether to include a decoded field containing the decoded transaction (equivalent to RPC decoderawtransaction)
   * @returns {Promsie<object|Error>} object with details about the transaction.
   */
  gettransaction(txid, include_watchonly = true, verbose = false) { return this.__send('gettransaction', [txid, include_watchonly, verbose]) }

  /**
   * DEPRECATED Identical to getbalances().mine.untrusted_pending.
   * @returns {Promise<number|Error>} The balance.
   */
  getunconfirmedbalance() { return this.__send('getunconfirmedbalance') }

  /**
   * Returns an object containing various wallet state info.
   * @returns {Promise<object|Error>} object with various wallet state info.
   */
  getwalletinfo() { return this.__send('getwalletinfo') }

  /**
   * Adds an address or script (in hex) that can be watched as if it were in your wallet but cannot be used to spend. Requires a new wallet backup.  
   * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported address exists but related transactions are still missing, leading to temporarily incorrect/bogus balances and unspent outputs until rescan completes.  
   * If you have the full public key, you should call importpubkey instead of this.  
   * Hint: use importmulti to import more than one address.  
   * Note: If you import a non-standard raw script in hex form, outputs sending to it will be treated as change, and not show up in many RPCs.  
   * Note: Use “getwalletinfo” to query the scanning progress.
   * @param {string} address required. The Bitcoin address (or hex-encoded script).
   * @param {string} label optional. default = "". An optional label.
   * @param {boolean} rescan optional. default = true. Rescan the wallet for transactions.
   * @param {boolean} p2sh optional. default = false. Add the P2SH version of the script as well.
   * @returns {Promise<null|Error>} null
   */
  importaddress(address, label = "", rescan = true, p2sh = false) { return this.__send('importaddress', [address, label, rescan, p2sh]) }

  /**
   * Import descriptors. This will trigger a rescan of the blockchain based on the earliest timestamp of all descriptors being imported. Requires a new wallet backup.  
   * Note: This call can take over an hour to complete if using an early timestamp; during that time, other rpc calls may report that the imported keys, addresses or scripts exist but related transactions are still missing.  
   * @param {Array<object>} requests required. Data to be imported.
   * @returns {Promise<Array<object>|Error>} Array of objects with result for every request.
   */
  importdescriptors(requests) { return this.__send('importdescriptors', [requests]) }

  /**
   * Import addresses/scripts (with private or public keys, redeem script (P2SH)), optionally rescanning the blockchain from the earliest creation time of the imported scripts. Requires a new wallet backup.  
   * If an address/script is imported without all of the private keys required to spend from that address, it will be watchonly. The ‘watchonly’ option must be set to true in this case or a warning will be returned.  
   * Conversely, if all the private keys are provided and the address/script is spendable, the watchonly option must be set to false, or a warning will be returned.  
   * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported keys, addresses or scripts exist but related transactions are still missing.  
   * Note: Use “getwalletinfo” to query the scanning progress.
   * @param {Array<object>} requests required. Data to be imported “range”: n or [n,n], (numeric or array) If a ranged descriptor is used, this specifies the end or the range (in the form [begin,end]) to import “internal”: bool, (boolean, optional, default=false) Stating whether matching outputs should be treated as not incoming payments (also known as change) “watchonly”: bool, (boolean, optional, default=false) Stating whether matching outputs should be considered watchonly. “label”: “str”, (string, optional, default=’’) Label to assign to the address, only allowed with internal=false “keypool”: bool, (boolean, optional, default=false) Stating whether imported public keys should be added to the keypool for when users request new addresses. Only allowed when wallet private keys are disabled }, … ]
   * @param {object} options optional. {"rescan": bool }
   * @returns {Promise<Array<object>|Error>} Array of objects with result for every request.
   */
  importmulti(requests, options) { return this.__send('importmulti', [requests, options]) }

  /**
   * Adds a private key (as returned by dumpprivkey) to your wallet. Requires a new wallet backup.  
   * Hint: use importmulti to import more than one private key.  
   * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported key exists but related transactions are still missing, leading to temporarily incorrect/bogus balances and unspent outputs until rescan completes.  
   * Note: Use “getwalletinfo” to query the scanning progress.  
   * @param {string} privkey required. The private key (see dumpprivkey).
   * @param {string} label optional. default = current label if address exists, otherwise "". An optional label.
   * @param {boolean} rescan optional. default = true. Rescan the wallet for transactions.
   * @returns {Promise<null|Error>} null
   */
  importprivkey(privkey, label, rescan) { return this.__send('importprivkey', [privkey, label, rescan]) }

  /**
   * Imports funds without rescan. Corresponding address or script must previously be included in wallet. Aimed towards pruned wallets. The end-user is responsible to import additional transactions that subsequently spend the imported outputs or rescan after the point in the blockchain the transaction is included.  
   * @param {string} rawtransaction required. A raw transaction in hex funding an already-existing address in wallet.
   * @param {string} txoutproof required. The hex output from gettxoutproof that contains the transaction.
   * @returns {Promise<null|Error>} null.
   */
  importprunedfunds(rawtransaction, txoutproof) { return this.__send('importprunedfunds', [rawtransaction, txoutproof]) }

  /**
   * Adds a public key (in hex) that can be watched as if it were in your wallet but cannot be used to spend. Requires a new wallet backup.  
   * Hint: use importmulti to import more than one public key.  
   * Note: This call can take over an hour to complete if rescan is true, during that time, other rpc calls may report that the imported pubkey exists but related transactions are still missing, leading to temporarily incorrect/bogus balances and unspent outputs until rescan completes.  
   * Note: Use “getwalletinfo” to query the scanning progress.  
   * @param {string} pubkey required. The hex-encoded public key.
   * @param {string} label optional. default = "". An optional label.
   * @param {boolean} rescan optional. default = true. Rescan the wallet for transactions.
   * @returns {Promise<null|Error>} null
   */
  importpubkey(pubkey, label = "", rescan = true) { return this.__send('importpubkey', [pubkey, label, rescan]) }

  /**
   * Imports keys from a wallet dump file (see dumpwallet). Requires a new wallet backup to include imported keys.  
   * Note: Use “getwalletinfo” to query the scanning progress.  
   * @param {string} filename required. The wallet file.
   * @returns {Promise<null|Error>} null
   */
  importwallet(filename) { return this.__send('importwallet', [filename]) }

  /**
   * Fills the keypool. Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
   * @param {number} newsize optional. default = 100. The new keypool size.
   * @returns {Promise<null|Error>} null
   */
  keypoolrefill(newsize) { return this.__send('keypoolrefill', [newsize]) }

  /**
   * Lists groups of addresses which have had their common ownership made public by common use as inputs or as the resulting change in past transactions.
   * @returns {Promise<Array<Array<Array<string|number>>>|Error>} Array of groups of addresses.
   */
  listaddressgroupings() { return this.__send('listaddressgroupings') }

  /**
   * Returns the list of all labels, or labels that are assigned to addresses with a specific purpose.
   * @param {string} purpose optional. Address purpose to list labels for (‘send’,’receive’). An empty string is the same as not providing this argument.
   * @returns {Promise<Array<string>|Error>} Array of labels.
   */
  listlabels(purpose) { return this.__send('listlabels', [purpose]) }

  /**
   * Returns list of temporarily unspendable outputs. See the lockunspent call to lock and unlock transactions for spending.
   * @returns {Promise<Array<object>|Error>} Array of temporarily unspendable outputs.
   */
  listlockunspent() { return this.__send('listlockunspent') }

  /**
   * List balances by receiving address.
   * @param {number} minconf optional. default = 1. The minimum number of confirmations before payments are included.
   * @param {boolean} include_empty optional. default = false. Whether to include addresses that haven’t received any payments.
   * @param {boolean} include_watchonly optional. default = true for watch-only wallets, otherwise false. Whether to include watch-only addresses (see ‘importaddress’).
   * @param {string} address_filter optional. If present, only return information on this address.
   * @returns {Promise<Array<object>|Error>} Array of balances by receiving address.
   */
  listreceivedbyaddress(minconf = 1, include_empty = false, include_watchonly = true, address_filter) { return this.__send('listreceivedbyaddress', [minconf, include_empty, include_watchonly, address_filter]) }

  /**
   * List received transactions by label.
   * @param {number} minconf optional. default = 1. The minimum number of confirmations before payments are included.
   * @param {boolean} include_empty optional. default = false. Whether to include labels that haven’t received any payments.
   * @param {boolean} include_watchonly optional. default = true for watch-only wallets, otherwise false. Whether to include watch-only addresses (see ‘importaddress’)
   * @returns {Promise<Array<object>|Error>} Array of received transactions by label.
   */
  listreceivedbylabel(minconf = 1, include_empty = false, include_watchonly = true) { return this.__send('listreceivedbylabel', [minconf, include_empty, include_watchonly]) }

  /**
   * Get all transactions in blocks since block [blockhash], or all transactions if omitted.  
   * If “blockhash” is no longer a part of the main chain, transactions from the fork point onward are included.  
   * Additionally, if include_removed is set, transactions affecting the wallet which were removed are returned in the “removed” array.
   * @param {string} blockhash optional. If set, the block hash to list transactions since, otherwise list all transactions.
   * @param {number} target_comfirmations optional. default = 1. Return the nth block hash from the main chain. e.g. 1 would mean the best block hash. Note: this is not used as a filter, but only affects [lastblock] in the return value.
   * @param {boolean} include_watchonly optional. default = true for watch-only wallets, otherwise false.
   * @param {boolean} include_removed optional. default = true. Show transactions that were removed due to a reorg in the “removed” array (not guaranteed to work on pruned nodes)
   * @returns {Promise<object|Error>} all transactions in blocks since block.
   */
  listsinceblock(blockhash, target_comfirmations = 1, include_watchonly = true, include_removed = true) { return this.__send('listsinceblock', [blockhash, target_comfirmations, include_watchonly, include_removed]) }

  /**
   * If a label name is provided, this will return only incoming transactions paying to addresses with the specified label. Returns up to ‘count’ most recent transactions skipping the first ‘from’ transactions.
   * @param {string} label optional. If set, should be a valid label name to return only incoming transactions with the specified label, or “*” to disable filtering and return all transactions.
   * @param {number} count optional. default = 10. The number of transactions to return.
   * @param {number} skip optional. default = 0. The number of transactions to skip.
   * @param {boolean} include_watchonly optional. default = true for watch-only wallets, otherwise false. Include transactions to watch-only addresses (see ‘importaddress’)
   * @returns {Promise<Arrayyobject>|Error>} Up to ‘count’ most recent transactions.
   */
  listtransactions(label, count = 10, skip = 0, include_watchonly = true) { return this.__send('listtransactions', [label, count, skip, include_watchonly]) }

  /**
   * Returns array of unspent transaction outputs with between minconf and maxconf (inclusive) confirmations.  
   * Optionally filter to only include txouts paid to specified addresses.  
   * @param {number} minconf optional. default = 1. The minimum confirmations to filter.
   * @param {number} maxconf optional. default = 9999999. The maximum confirmations to filter
   * @param {Array<string>} addresses optional. default = []. The bitcoin addresses to filter
   * @param {boolean} include_unsafe optional. default = true. Include outputs that are not safe to spend. See description of “safe” attribute below.
   * @param {object} query_options optional. JSON with query options.
   * @returns {Promise<Array<object>|Error>} Array of unspent transaction outputs. 
   */
  listunspent(minconf = 1, maxconf = 9999999, addresses = [], include_unsafe = true, query_options) { return this.__send('listunspent', [minconf, maxconf, addresses, include_unsafe, query_options]) }

  /**
   * Returns a list of wallets in the wallet directory.
   * @returns {Promise<object|Error>} Array of wallets in the wallet directory.
   */
  listwalletdir() { return this.__send('listwalletdir') }

  /**
   * Returns a list of currently loaded wallets. For full information on the wallet, use "getwalletinfo"
   * @returns {Promise<Array<string>|Error>} Array of currently loaded wallets.
   */
  listwallets() { return this.__send('listwallets') }

  /**
   * Loads a wallet from a wallet file or directory.  
   * Note that all wallet command-line options used when starting bitcoind will be applied to the new wallet (eg -rescan, etc).  
   * @param {string} filename required.
   * @param {boolean} load_on_startup optional. default = null
   * @returns {Promise<object|Error>} object with wallet name and/or warning
   */
  loadwallet(filename, load_on_startup) { return this.__send('loadwallet', [filename, load_on_startup]) }

  /**
   * Updates list of temporarily unspendable outputs.  
   * Temporarily lock (unlock=false) or unlock (unlock=true) specified transaction outputs.  
   * If no transaction outputs are specified when unlocking then all current locked transaction outputs are unlocked.  
   * A locked transaction output will not be chosen by automatic coin selection, when spending bitcoins.  
   * Manually selected coins are automatically unlocked.  
   * Locks are stored in memory only. Nodes start with zero locked outputs, and the locked output list is always cleared (by virtue of process exit) when a node stops or fails.  
   * Also see the listunspent call  
   * @param {boolean} unlock required. Whether to unlock (true) or lock (false) the specified transactions.
   * @param {Array<object>} transactions optional. default = []. The transaction outputs and within each, the txid (string) vout (numeric).
   * @returns {Promise<boolean|Error>} Whether the command was successful or not
   */
  lockunspent(unlock, transactions) { return this.__send('lockunspent', [unlock, transactions]) }

  /**
   * Bumps the fee of an opt-in-RBF transaction T, replacing it with a new transaction B.  
   * Returns a PSBT instead of creating and signing a new transaction.  
   * An opt-in RBF transaction with the given txid must be in the wallet.  
   * The command will pay the additional fee by reducing change outputs or adding inputs when necessary.  
   * It may add a new change output if one does not already exist.  
   * All inputs in the original transaction will be included in the replacement transaction.  
   * The command will fail if the wallet or mempool contains a transaction that spends one of T’s outputs.  
   * By default, the new fee will be calculated automatically using the estimatesmartfee RPC.  
   * The user can specify a confirmation target for estimatesmartfee.  
   * Alternatively, the user can specify a fee rate in sat/vB for the new transaction.  
   * At a minimum, the new fee rate must be high enough to pay an additional new relay fee (incrementalfee returned by getnetworkinfo) to enter the node’s mempool.  
   * * WARNING: before version 0.21, fee_rate was in BTC/kvB. As of 0.21, fee_rate is in sat/vB. *
   * @param {string} txid required. The txid to be bumped.
   * @param {object} options optional. options.
   * @returns {Promise<object|Error>} object with base64-encoded unsigned PSBT and fees.
   */
  psbtbumpfee(txid, options) { return this.__send('psbtbumpfee', [txid, options]) }

  /**
   * Deletes the specified transaction from the wallet. Meant for use with pruned wallets and as a companion to importprunedfunds. This will affect wallet balances.
   * @param {string} txid required. The hex-encoded id of the transaction you are deleting.
   * @returns {Promise<null|Error>} null
   */
  removeprunedfunds(txid) { return this.__send('removeprunedfunds', [txid]) }

  /**
   * Rescan the local blockchain for wallet related transactions. Note: Use “getwalletinfo” to query the scanning progress.
   * @param {number} start_height optional. default = 0. Block height where the rescan should start.
   * @param {number} stop_height optional. The last block height that should be scanned. If none is provided it will rescan up to the tip at return time of this call.
   * @returns {Promise<object|Error>} object with start and stop height.
   */
  rescanblockchain(start_height, stop_height) { return this.__send('rescanblockchain', [start_height, stop_height]) }

  /**
   * EXPERIMENTAL warning: this call may be changed in future releases. Send a transaction.
   * @param {Array<object>} outputs required. The outputs (key-value pairs), where none of the keys are duplicated. That is, each address can only appear once and there can only be one ‘data’ object. For convenience, a dictionary, which holds the key-value pairs directly, is also accepted.
   * @param {number} conf_target optional. default=wallet -txconfirmtarget. Confirmation target in blocks.
   * @param {string} estimate_mode optional. default = "unset". The fee estimate mode, must be one of (case insensitive): “unset” “economical” “conservative”
   * @param {number|string} fee_rate optional. default = not set. fall back to wallet fee estimation. Specify a fee rate in sat/vB.
   * @param {object} options optional. “locktime”: n, (numeric, optional, default=0) Raw locktime. Non-0 value also locktime-activates inputs “lock_unspents”: bool, (boolean, optional, default=false) Lock selected unspent outputs “psbt”: bool, (boolean, optional, default=automatic) Always return a PSBT, implies add_to_wallet=false. “subtract_fee_from_outputs”: [ (json array, optional, default=empty array) Outputs to subtract the fee from, specified as integer indices. The fee will be equally deducted from the amount of each specified output. Those recipients will receive less bitcoins than you enter in their corresponding amount field. If no outputs are specified here, the sender pays the fee. vout_index, (numeric) The zero-based output index, before a change output is added. … ], “replaceable”: bool, (boolean, optional, default=wallet default) Marks this transaction as BIP125 replaceable. Allows this transaction to be replaced by a transaction with higher fees }
   * @returns {Promise<object|Error>} object with details to the transaction
   */
  send(outputs, conf_target, estimate_mode = "unset", fee_rate, options) { return this.__send('send', [outputs, conf_target, estimate_mode, fee_rate, options]) }

  /**
   * Send multiple times. Amounts are double-precision floating point numbers.  
   * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.  
   * @param {string} dummy required. Must be set to “” for backwards compatibility.
   * @param {object} amounts required. The addresses and amounts.
   * @param {number} minconf optional. Ignored dummy value
   * @param {string} comment optional. A comment.
   * @param {Array<string>} subtractfeefrom optional. The addresses. The fee will be equally deducted from the amount of each selected address. Those recipients will receive less bitcoins than you enter in their corresponding amount field. If no addresses are specified here, the sender pays the fee.
   * @param {boolean} replaceable optional. default = wallet default. Allow this transaction to be replaced by a transaction with higher fees via BIP 125.
   * @param {number} conf_target optional. default = wallet -txconfirmtarget. Confirmation target in blocks.
   * @param {string} estimate_mode optional. default = "unset". The fee estimate mode, must be one of (case insensitive): “unset” “economical” “conservative”
   * @param {number|string} fee_rate optional. default = not set. fall back to wallet fee estimation. Specify a fee rate in sat/vB.
   * @returns {Proimse<string|object|Error>} The transaction id for the send. Only 1 transaction is created
   */
  sendmany(dummy = "", amounts, minconf, comment, subtractfeefrom, replaceable, conf_target, estimate_mode = "unset", fee_rate) { return this.__send('sendmany', [dummy, amounts, minconf, comment, subtractfeefrom, replaceable, conf_target, estimate_mode, fee_rate]) }

  /**
   * Send an amount to a given address. Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
   * @param {string} address required. The bitcoin address to send to.
   * @param {number|string} amount required. The amount in BTC to send. eg 0.1.
   * @param {string} comment optional. A comment used to store what the transaction is for. This is not part of the transaction, just kept in your wallet.
   * @param {string} comment_to optional. A comment to store the name of the person or organization to which you’re sending the transaction. This is not part of the transaction, just kept in your wallet.
   * @param {boolean} subtractfeefromamount optional. default = false. The fee will be deducted from the amount being sent. The recipient will receive less bitcoins than you enter in the amount field.
   * @param {boolean} replaceable optional. default = wallet default. Allow this transaction to be replaced by a transaction with higher fees via BIP 125.
   * @param {number} conf_target optional. default = wallet -txconfirmtarget. Confirmation target in blocks.
   * @param {string} estimate_mode optional. default = "unset". The fee estimate mode, must be one of (case insensitive): “unset” “economical” “conservative”
   * @param {boolean} avoid_reuse optional. default = true. (only available if avoid_reuse wallet flag is set) Avoid spending from dirty addresses; addresses are considered dirty if they have previously been used in a transaction.
   * @param {boolean} verbose optional. default = false. true for a json object, false for the hex-encoded data.
   * @returns {Promise<string|object|Error>} string or object with the transaction id.
   */
  sendtoaddress(address, amount, comment, comment_to, subtractfeefromamount = false, replaceable, conf_target, estimate_mode = "unset", avoid_reuse = true, verbose = false) { return this.__send('sendtoaddress', [address, amount, comment, comment_to, subtractfeefromamount, replaceable, conf_target, estimate_mode, avoid_reuse, verbose]) }

  /**
   * Set or generate a new HD wallet seed. Non-HD wallets will not be upgraded to being a HD wallet. Wallets that are already HD will have a new HD seed set so that new keys added to the keypool will be derived from this new seed.  
   * Note that you will need to MAKE A NEW BACKUP of your wallet after setting the HD wallet seed.  
   * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.  
   * @param {boolean} newkeypool optional. default = true. Whether to flush old unused addresses, including change addresses, from the keypool and regenerate it. If true, the next address from getnewaddress and change address from getrawchangeaddress will be from this new seed. If false, addresses (including change addresses if the wallet already had HD Chain Split enabled) from the existing keypool will be used until it has been depleted.
   * @param {string} seed optional. default = random seed. The WIF private key to use as the new HD seed. The seed value can be retrieved using the dumpwallet command. It is the private key marked hdseed=1
   * @returns {Promise<null|Error>} null
   */
  sethdseed(newkeypool = true, seed) { return this.__send('sethdseed', [newkeypool, seed]) }

  /**
   * Sets the label associated with the given address.
   * @param {string} address required. The bitcoin address to be associated with a label.
   * @param {string} label required. The label to assign to the address.
   * @returns {Promise<null|Error>} null
   */
  setlabel(address, label) { return this.__send('setlabel', [address, label]) }

  /**
   * Set the transaction fee per kB for this wallet. Overrides the global -paytxfee command line parameter. Can be deactivated by passing 0 as the fee. In that case automatic fee selection will be used by default.
   * @param {number|string} amount required. The transaction fee in BTC/kvB
   * @returns {Promise<boolean|Error>} Returns true if successful
   */
  settxfee(amount) { return this.__send('settxfee', [amount]) }

  /**
   * Change the state of the given wallet flag for a wallet.
   * @param {string} flag required. The name of the flag to change. Current available flags: avoid_reuse.
   * @param {boolean} value optional. default = true. The new state.
   * @returns {Promise<object|Error>} object with new state for this flag.
   */
  setwalletflag(flag, value = true) { return this.__send('setwalletflag', [flag, value]) }

  /**
   * Sign a message with the private key of an address Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.
   * @param {string} address required. The bitcoin address to use for the private key.
   * @param {string} message required. The message to create a signature of.
   * @returns {Promise<string|Error>} The signature of the message encoded in base 64.
   */
  signmessage(address, message) { return this.__send('signmessage', [address, message]) }

  /**
   * Sign inputs for raw transaction (serialized, hex-encoded).  
   * The second optional argument (may be null) is an array of previous transaction outputs that this transaction depends on but may not yet be in the block chain.  
   * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.  
   * @param {string} hexstring required. The transaction hex string.
   * @param {Array<object>} prevtxs optional. The previous dependent transaction outputs.
   * @param {string} sighashtype optional. default = "ALL". The signature hash type. Must be one of “ALL” “NONE” “SINGLE” “ALL|ANYONECANPAY” “NONE|ANYONECANPAY” “SINGLE|ANYONECANPAY”
   * @returns {Promise<object|Error>} object with hex-encoded raw transaction with signature(s)
   */
  signrawtransactionwithwallet(hexstring, prevtxs, sighashtype = "ALL") { return this.__send('signrawtransactionwithwallet', [hexstring, prevtxs, sighashtype]) }

  /**
   * Unloads the wallet referenced by the request endpoint otherwise unloads the wallet specified in the argument.  
   * Specifying the wallet name on a wallet endpoint is invalid.  
   * @param {string} wallet_name optional. default = the wallet name from the RPC endpoint. The name of the wallet to unload. Must be provided in the RPC endpoint or this parameter (but not both).
   * @param {boolean} load_on_startup optional. default = null. Save wallet name to persistent settings and load on startup. True to add wallet to startup list, false to remove, null to leave unchanged.
   * @returns {Promise<object|Error>} object with warning message
   */
  unloadwallet(wallet_name, load_on_startup = null) { return this.__send('unloadwallet', [wallet_name, load_on_startup]) }

  /**
   * Upgrade the wallet. Upgrades to the latest version if no version number is specified.  
   * New keys may be generated and a new wallet backup will need to be made.  
   * @param {number} version optional. default = 169900. The version number to upgrade to. Default is the latest wallet version.
   * @returns {Promise<object|Error>} object with wallet name, previous version, current version result and error.
   */
  upgradewallet(version) { return this.__send('upgradewallet', [version]) }

  /**
   * Creates and funds a transaction in the Partially Signed Transaction format.  
   * Implements the Creator and Updater roles.  
   * @param {Array<object>} inputs optional. Leave empty to add inputs automatically. See add_inputs option.
   * @param {Array<object>} outputs required. The outputs (key-value pairs), where none of the keys are duplicated. That is, each address can only appear once and there can only be one ‘data’ object. For compatibility reasons, a dictionary, which holds the key-value pairs directly, is also accepted as second parameter.
   * @param {number} locktime optional. default = 0. Raw locktime. Non-0 value also locktime-activates inputs.
   * @param {object} options optional. “replaceable”: bool, (boolean, optional, default=wallet default) Marks this transaction as BIP125 replaceable. Allows this transaction to be replaced by a transaction with higher fees “conf_target”: n, (numeric, optional, default=wallet -txconfirmtarget) Confirmation target in blocks “estimate_mode”: “str”, (string, optional, default=unset) The fee estimate mode, must be one of (case insensitive): “unset” “economical” “conservative” }
   * @param {boolean} bip32derivs optional. default = true. Include BIP 32 derivation paths for public keys if we know them.
   * @returns {Promise<object|Error>} object with resulting transaction (base64-encoded string)
   */
  walletcreatefundedpsbt(inputs, outputs, locktime = 0, options, bip32derivs = true) { return this.__send('walletcreatefundedpsbt', [inputs, outputs, locktime, options, bip32derivs]) }

  /**
   * Removes the wallet encryption key from memory, locking the wallet. After calling this method, you will need to call walletpassphrase again before being able to call any methods which require the wallet to be unlocked.
   * @returns {Promise<null|Error>} null
   */
  walletlock() { return this.__send('walletlock') }

  /**
   * Stores the wallet decryption key in memory for ‘timeout’ seconds.  
   * This is needed prior to performing transactions related to private keys such as sending bitcoins Note:  
   * Issuing the walletpassphrase command while the wallet is already unlocked will set a new unlock time that overrides the old one.
   * @param {string} passphrase required. The wallet passphrase.
   * @param {number} timeout required. The time to keep the decryption key in seconds; capped at 100000000 (~3 years).
   * @returns {Promise<null|Error>} null
   */
  walletpassphrase(passphrase, timeout) { return this.__send('walletpassphrase', [passphrase, timeout]) }

  /**
   * Changes the wallet passphrase from 'oldpassphrase' to 'newpassphrase'.
   * @param {string} oldpassphrase required. The current passphrase.
   * @param {string} newpassphrase required. The new passphrase.
   * @returns {Promise<null|Error>} null
   */
  walletpassphrasechange(oldpassphrase, newpassphrase) { return this.__send('walletpassphrasechange', [oldpassphrase, newpassphrase]) }

  /**
   * Update a PSBT with input information from our wallet and then sign inputs that we can sign for.  
   * Requires wallet passphrase to be set with walletpassphrase call if wallet is encrypted.  
   * @param {string} psbt required. The transaction base64 string.
   * @param {boolean} sign optional. default = true. Also sign the transaction when updating.
   * @param {string} sighashtype optional. default = "ALL". The signature hash type to sign with if not specified by the PSBT. Must be one of “ALL” “NONE” “SINGLE” “ALL|ANYONECANPAY” “NONE|ANYONECANPAY” “SINGLE|ANYONECANPAY”
   * @param {boolean} bip32derivs optional. default = true. Include BIP 32 derivation paths for public keys if we know them.
   * @returns {Promise<object|Error>} object with base64-encoded paritally signed transaction and wether or not the transaction has a complete signature.
   */
  walletprocesspsbt(psbt, sign = true, sighashtype = "ALL", bip32derivs = true) { return this.__send('walletprocesspsbt', [psbt, sign, sighashtype, bip32derivs]) }
  // #endregion
  // #endregion
}
