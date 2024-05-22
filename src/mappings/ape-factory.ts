
// /* eslint-disable prefer-const */
// import { TokenCreated } from "../types/ApeFactory/ApeFactory";
// import { BondingCurve, Factory, Token, TokenMetaData } from "../types/schema";
// import { BondingCurve as BondingCurveTemplate, TokenMetadata as TokenMetadataTemplate } from '../types/templates'
// import { BigDecimal, BigInt, log, ipfs, json, JSONValue } from '@graphprotocol/graph-ts'

// import {
//   exponentToBigDecimal,
//   FACTORY_ADDRESS,
//   fetchBondingCurveCirculatingSupply,
//   fetchBondingCurveCurrentPrice,
//   fetchBondingCurvePoolBalance,
//   fetchBondingCurveReserveRatio,
//   fetchBondingCurveUniswapRouter,
//   fetchEthAmountToCompleteCurve,
//   fetchTokenAmountToCompleteCurve,
//   fetchTokenDecimals,
//   fetchTokenName,
//   fetchTokenSymbol,
//   fetchTokenTotalSupply,
//   fetchTokenURI,
//   ZERO_BD,
//   ZERO_BI,
// } from './helpers'

// export function handleTokenCreated(event: TokenCreated): void {
//   // load factory (create if first exchange)
//   let factory = Factory.load(FACTORY_ADDRESS)
//   if (factory === null) {
//     factory = new Factory(FACTORY_ADDRESS)

//     factory.bondingCurveCount = 0
//     factory.tokenCount = 0
//     factory.txCount = ZERO_BI
//   }

//   factory.bondingCurveCount = factory.bondingCurveCount + 1
//   factory.tokenCount = factory.tokenCount + 1
//   factory.save()

//   // create the tokens
//   let token = Token.load(event.params.token.toHexString())
//   let bondingCurve = BondingCurve.load(event.params.bondingCurve.toHexString())

//   if (token === null) {
//     token = new Token(event.params.token.toHexString())
//     token.symbol = fetchTokenSymbol(event.params.token)
//     token.name = fetchTokenName(event.params.token)
//     token.tokenURI = fetchTokenURI(event.params.token)

//     token.totalSupply = fetchTokenTotalSupply(event.params.token)
//     let decimals = fetchTokenDecimals(event.params.token)

//     // bail if we couldn't figure out the decimals
//     if (decimals === null) {
//       log.debug('mybug the decimal on token 0 was null', [])
//       return
//     }
//     token.decimals = decimals

//     // token.factory = FACTORY_ADDRESS
//     token.factory = event.address.toHexString()

//     // Fetch metadata from IPFS
//     let metadataURI = token.tokenURI
//     if (metadataURI.startsWith('ipfs://')) {
//       let metadataHash = metadataURI.split('ipfs://')[1]
//       TokenMetadataTemplate.create(metadataHash)
//       token.metaData = metadataHash
//     }
//   }

//   // fetch info if null
//   if (bondingCurve === null) {
//     bondingCurve = new BondingCurve(event.params.bondingCurve.toHexString())

//     const reserveRatio = fetchBondingCurveReserveRatio(event.params.bondingCurve)
//     const poolBalance = fetchBondingCurvePoolBalance(event.params.bondingCurve)
//     const circulatingSupply = fetchBondingCurveCirculatingSupply(event.params.bondingCurve)

//     const currentPrice = fetchBondingCurveCurrentPrice(event.params.bondingCurve)
//     const marketCap = currentPrice.times(token.totalSupply.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18'))))

//     bondingCurve.reserveRatio = reserveRatio
//     bondingCurve.poolBalance = poolBalance
//     bondingCurve.circulatingSupply = circulatingSupply
//     bondingCurve.currentPrice = currentPrice
//     bondingCurve.marketCap = marketCap

//     // bondingCurve.reserveRatio = fetchBondingCurveReserveRatio(event.params.bondingCurve)
//     // bondingCurve.poolBalance = fetchBondingCurvePoolBalance(event.params.bondingCurve)
//     // bondingCurve.circulatingSupply = fetchBondingCurveCirculatingSupply(event.params.bondingCurve)

//     bondingCurve.ethAmountToCompleteCurve = fetchEthAmountToCompleteCurve(event.params.bondingCurve)
//     bondingCurve.tokenAmountToCompleteCurve = fetchTokenAmountToCompleteCurve(event.params.bondingCurve)

//     bondingCurve.totalEthAmountToCompleteCurve = bondingCurve.ethAmountToCompleteCurve
//     bondingCurve.totalTokenAmountToCompleteCurve = bondingCurve.tokenAmountToCompleteCurve

//     bondingCurve.uniswapRouter = fetchBondingCurveUniswapRouter(event.params.bondingCurve)

//     bondingCurve.createdAtTimestamp = event.block.timestamp
//     bondingCurve.createdAtBlockNumber = event.block.number
//     bondingCurve.active = true
//     bondingCurve.txCount = ZERO_BI

//     // bondingCurve.factory = FACTORY_ADDRESS
//     bondingCurve.factory = event.address.toHexString()
//   }

//   bondingCurve.token = token.id
//   token.bondingCurve = bondingCurve.id
//   // create the tracked contract based on the template
//   BondingCurveTemplate.create(event.params.bondingCurve)

//   // save updated values
//   token.save()
//   bondingCurve.save()
//   factory.save()
// }

// // export function handleTokenCreated(event: TokenCreated): void {
// //   console.log("hello")
// // }



/* eslint-disable prefer-const */
import { TokenCreated } from "../types/ApeFactory/ApeFactory";
import { BondingCurve, Factory, Token, TokenMetaData } from "../types/schema";
import { BondingCurve as BondingCurveTemplate } from '../types/templates'
import { BigDecimal, BigInt, log, ipfs, json, JSONValue } from '@graphprotocol/graph-ts'

import {
  exponentToBigDecimal,
  FACTORY_ADDRESS,
  fetchBondingCurveCirculatingSupply,
  fetchBondingCurveCurrentPrice,
  fetchBondingCurvePoolBalance,
  fetchBondingCurveReserveRatio,
  fetchBondingCurveUniswapRouter,
  fetchEthAmountToCompleteCurve,
  fetchTokenAmountToCompleteCurve,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
  fetchTokenURI,
  ZERO_BD,
  ZERO_BI,
} from './helpers'

export function handleTokenCreated(event: TokenCreated): void {
  // load factory (create if first exchange)
  let factory = Factory.load(FACTORY_ADDRESS)
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS)

    factory.bondingCurveCount = 0
    factory.tokenCount = 0
    factory.txCount = ZERO_BI
  }

  factory.bondingCurveCount = factory.bondingCurveCount + 1
  factory.tokenCount = factory.tokenCount + 1
  factory.save()

  // create the tokens
  let token = Token.load(event.params.token.toHexString())
  let bondingCurve = BondingCurve.load(event.params.bondingCurve.toHexString())

  if (token === null) {
    token = new Token(event.params.token.toHexString())
    token.symbol = fetchTokenSymbol(event.params.token)
    token.name = fetchTokenName(event.params.token)
    token.tokenURI = fetchTokenURI(event.params.token)

    token.totalSupply = fetchTokenTotalSupply(event.params.token)
    let decimals = fetchTokenDecimals(event.params.token)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }
    token.decimals = decimals

    // token.factory = FACTORY_ADDRESS
    token.factory = event.address.toHexString()

    // Fetch metadata from IPFS
    let metadataURI = token.tokenURI
    if (metadataURI.startsWith('https://ipfs.io/ipfs/')) {

      let metadataHash = metadataURI.split('https://ipfs.io/ipfs/')[1]
      let metadataBytes = ipfs.cat(metadataHash)
      if (!metadataBytes) return;   
      let tokenMetaData = new TokenMetaData(token.id)

      let metadataValue = json.fromBytes(metadataBytes).toObject();

      let name = metadataValue.get('name')
      let symbol = metadataValue.get('symbol')
      let image = metadataValue.get('image')
      let description = metadataValue.get('description')
      let twitter = metadataValue.get('twitter')
      let telegram = metadataValue.get('telegram')
      let website = metadataValue.get('website')

      if (!name || !symbol || !image || !description) { 
        return
      }

      tokenMetaData.name = name.toString()
      tokenMetaData.symbol = symbol.toString()
      tokenMetaData.image = image.toString()
      tokenMetaData.description = description.toString()

      if(twitter){
        tokenMetaData.twitter = twitter.toString()
      }

      if (telegram) {
        tokenMetaData.telegram = telegram.toString()
      }

      if (website) {
        tokenMetaData.website = website.toString()
      }

      tokenMetaData.save()
      token.metaData = tokenMetaData.id;
    }
  }

  // fetch info if null
  if (bondingCurve === null) {
    bondingCurve = new BondingCurve(event.params.bondingCurve.toHexString())

    const reserveRatio = fetchBondingCurveReserveRatio(event.params.bondingCurve)
    const poolBalance = fetchBondingCurvePoolBalance(event.params.bondingCurve)
    const circulatingSupply = fetchBondingCurveCirculatingSupply(event.params.bondingCurve)

    const currentPrice = fetchBondingCurveCurrentPrice(event.params.bondingCurve)
    const marketCap = currentPrice.times(token.totalSupply.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18'))))

    bondingCurve.reserveRatio = reserveRatio
    bondingCurve.poolBalance = poolBalance
    bondingCurve.circulatingSupply = circulatingSupply
    bondingCurve.currentPrice = currentPrice
    bondingCurve.marketCap = marketCap

    // bondingCurve.reserveRatio = fetchBondingCurveReserveRatio(event.params.bondingCurve)
    // bondingCurve.poolBalance = fetchBondingCurvePoolBalance(event.params.bondingCurve)
    // bondingCurve.circulatingSupply = fetchBondingCurveCirculatingSupply(event.params.bondingCurve)

    bondingCurve.ethAmountToCompleteCurve = fetchEthAmountToCompleteCurve(event.params.bondingCurve)
    bondingCurve.tokenAmountToCompleteCurve = fetchTokenAmountToCompleteCurve(event.params.bondingCurve)

    bondingCurve.totalEthAmountToCompleteCurve = bondingCurve.ethAmountToCompleteCurve
    bondingCurve.totalTokenAmountToCompleteCurve = bondingCurve.tokenAmountToCompleteCurve

    bondingCurve.uniswapRouter = fetchBondingCurveUniswapRouter(event.params.bondingCurve)

    bondingCurve.createdAtTimestamp = event.block.timestamp
    bondingCurve.createdAtBlockNumber = event.block.number
    bondingCurve.active = true
    bondingCurve.txCount = ZERO_BI

    // bondingCurve.factory = FACTORY_ADDRESS
    bondingCurve.factory = event.address.toHexString()
  }

  bondingCurve.token = token.id
  token.bondingCurve = bondingCurve.id
  // create the tracked contract based on the template
  BondingCurveTemplate.create(event.params.bondingCurve)

  // save updated values
  token.save()
  bondingCurve.save()
  factory.save()
}

// export function handleTokenCreated(event: TokenCreated): void {
//   console.log("hello")
// }