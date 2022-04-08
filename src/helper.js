import { RPC } from './constants.js';

export function isKnownMethod(method) {
  return RPC[method] !== undefined;
}

export function isValidArgsForMethod(method, args = []) {
  if (!isKnownMethod(method)) return false;
  const specifiedArgs = RPC[method].args;
  if (args.length !== specifiedArgs.length) return false;
  // some more validation..
  return false;
}


export function isValidMethodWithArgs(method, args = []) {
  const isKnownMethod = RPC[method] !== undefined;
  console.log('isKnownMethod', RPC, isKnownMethod);
}

export default {
  isKnownMethod,
  isValidArgsForMethod,
  isValidMethodWithArgs,
}