
/* eslint-disable prefer-const */
import { TokenCreated } from "../types/ApeFactory/ApeFactory";
import { BondingCurve, Factory, Token } from "../types/schema";
import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { BondingCurve as BondingCurveTemplate } from '../types/templates'

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

  // fetch info if null
  if (token === null) {
    token = new Token(event.params.token.toHexString())
    token.symbol = fetchTokenSymbol(event.params.token)
    token.name = fetchTokenName(event.params.token)
    token.imageURL = token.name
    
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