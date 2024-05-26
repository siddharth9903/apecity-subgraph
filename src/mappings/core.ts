/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt, ethereum, log, store } from '@graphprotocol/graph-ts'

import {
    BondingCurve,
    Factory,
    Token,
    Trade,
    Transaction,
    User,
} from '../types/schema'
import { ADDRESS_ZERO, BI_18, convertEthToDecimal, convertTokenToDecimal, createUser, exponentToBigDecimal, FACTORY_ADDRESS, fetchBondingCurveCirculatingSupply, fetchBondingCurveCurrentPrice, fetchBondingCurvePoolBalance, fetchEthAmountToCompleteCurve, fetchTokenAmountToCompleteCurve, ONE_BI, ZERO_BD } from './helpers'
import { BondingCurveComplete, LogBuy, LogSell } from '../types/ApeFactory/BondingCurve'

function updateBondingCurveAndFactory(bondingCurveAddress: Address, apeFactory: Factory): BondingCurve {
    let bondingCurve = BondingCurve.load(bondingCurveAddress.toHexString())!

    bondingCurve.poolBalance = fetchBondingCurvePoolBalance(bondingCurveAddress)
    bondingCurve.circulatingSupply = fetchBondingCurveCirculatingSupply(bondingCurveAddress)

    const currentPrice = fetchBondingCurveCurrentPrice(bondingCurveAddress)
    let token = Token.load(bondingCurve.token)!
    const marketCap = currentPrice.times(token.totalSupply.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18'))))

    bondingCurve.currentPrice = currentPrice
    bondingCurve.marketCap = marketCap

    bondingCurve.ethAmountToCompleteCurve = fetchEthAmountToCompleteCurve(bondingCurveAddress)
    bondingCurve.tokenAmountToCompleteCurve = fetchTokenAmountToCompleteCurve(bondingCurveAddress)

    bondingCurve.txCount = bondingCurve.txCount.plus(ONE_BI)

    apeFactory.txCount = apeFactory.txCount.plus(ONE_BI)

    return bondingCurve
}

function createOrLoadTransaction(event: ethereum.Event): Transaction {
    let transaction = Transaction.load(event.transaction.hash.toHexString())
    if (transaction === null) {
        transaction = new Transaction(event.transaction.hash.toHexString())
        transaction.blockNumber = event.block.number
        transaction.timestamp = event.block.timestamp
    }
    return transaction
}

export function handleBuy(event: LogBuy): void {
    let bondingCurveAddressStr = event.address.toHexString()
    let bondingCurveAddress = Address.fromString(bondingCurveAddressStr)
    let token = Token.load(BondingCurve.load(bondingCurveAddressStr)!.token)!

    let buyer = event.params.buyer
    createUser(buyer)

    let apeFactory = Factory.load(FACTORY_ADDRESS)!
    let notUpdatedBondingCurve = BondingCurve.load(bondingCurveAddress.toHexString())!
    let lastPrice = notUpdatedBondingCurve.currentPrice
    let bondingCurve = updateBondingCurveAndFactory(bondingCurveAddress, apeFactory)

    let transaction = createOrLoadTransaction(event)

    let trade = new Trade(
        bondingCurveAddressStr.concat('-').concat(bondingCurve.txCount.toString()),
    )
    trade.transaction = transaction.id
    trade.timestamp = transaction.timestamp
    trade.bondingCurve = bondingCurve.id
    trade.type = "BUY"
    trade.inAmount = convertEthToDecimal(event.params.totalCost)
    trade.outAmount = convertTokenToDecimal(event.params.amountBought, token.decimals)

    trade.openPrice = lastPrice
    trade.closePrice = bondingCurve.currentPrice
    trade.avgPrice = trade.inAmount.div(trade.outAmount)

    let userEntity = User.load(buyer.toHexString())!
    trade.user = userEntity.id

    transaction.trade = trade.id

    transaction.save()
    trade.save()
    bondingCurve.save()
    apeFactory.save()
    log.debug('buy logged', [])
}

export function handleSell(event: LogSell): void {
    let bondingCurveAddressStr = event.address.toHexString()
    let bondingCurveAddress = Address.fromString(bondingCurveAddressStr)
    let token = Token.load(BondingCurve.load(bondingCurveAddressStr)!.token)!

    let seller = event.params.seller
    createUser(seller)

    let apeFactory = Factory.load(FACTORY_ADDRESS)!
    let notUpdatedBondingCurve = BondingCurve.load(bondingCurveAddress.toHexString())!
    let lastPrice = notUpdatedBondingCurve.currentPrice

    let bondingCurve = updateBondingCurveAndFactory(bondingCurveAddress, apeFactory)

    let transaction = createOrLoadTransaction(event)

    let trade = new Trade(
        bondingCurveAddressStr.concat('-').concat(bondingCurve.txCount.toString()),
    )
    trade.transaction = transaction.id
    trade.timestamp = transaction.timestamp
    trade.bondingCurve = bondingCurve.id
    trade.type = "SELL"
    trade.inAmount = convertTokenToDecimal(event.params.amountSell, token.decimals)
    trade.outAmount = convertEthToDecimal(event.params.reward)

    trade.openPrice = lastPrice
    trade.closePrice = bondingCurve.currentPrice
    trade.avgPrice = trade.outAmount.div(trade.inAmount)

    let userEntity = User.load(seller.toHexString())!
    trade.user = userEntity.id

    transaction.trade = trade.id

    transaction.save()
    trade.save()
    bondingCurve.save()
    apeFactory.save()

    log.debug('sell logged', [])
}

export function handleBondingCurveCompletion(event: BondingCurveComplete): void {
    let bondingCurve = BondingCurve.load(event.address.toHexString())!

    bondingCurve.active = false;
    bondingCurve.uniswapLiquidityPool = event.params.liquidityPoolAddress

    bondingCurve.save()
    log.debug('curve complete logging', [])
}