# bitcoin-core-client
A Bitcoin Core REST and RPC client

## class BitcoinClient:  
  
> constructor({host: string, port: number, user: string, password: string})  
  
Create an instance of BitcoinClient class:  
> const client = new BitcoinClient({host: '192.168.0.100', port: 8332, user: 'some_user', password: 'some_secure_pw'});  
  
Implements all rpc functions as specified here: https://developer.bitcoin.org/reference/rpc/index.html  

***WARNING:*** RPC calls with arguments may not work yet (WIP). Calls without arguments should work fine..  

All rpc calls return a promise that resolves with the expected value or with an error.  

## Example:  

> const client = new BitcoinClient({host: '192.168.0.100', port: 8332, user: 'some_user', password: 'some_secure_pw'});  
> client.getUptime().then((uptime) => {  
> &nbsp;&nbsp;console.log(`Bitcoin node uptime: ${uptime}`);  
> }).catch((reason) => {  
> &nbsp;&nbsp;console.log(`Failed to get uptime: ${reason}`);  
> });  