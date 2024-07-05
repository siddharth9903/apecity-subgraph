/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { ERC20FixedSupply as ERC20 } from '../types/ApeFactory/ERC20FixedSupply'
import { ERC20NameBytes } from '../types/ApeFactory/ERC20NameBytes'
import { ERC20SymbolBytes } from '../types/ApeFactory/ERC20SymbolBytes'
import { User } from '../types/schema'
// import { Factory as FactoryContract } from '../types/templates/Pair/Factory'
import { BondingCurve as BondingCurveContract } from '../types/ApeFactory/BondingCurve'
import { ApeFactory as ApeFactoryContract } from '../types/templates/BondingCurve/ApeFactory'
import { TokenDefinition } from './tokenDefinition'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
//for base tenderly
// export const FACTORY_ADDRESS = '0x89de37f99a0ea5a6594eda4ee567d97e1b8111d9'
// //for base
// export const FACTORY_ADDRESS = '0x89de37f99a0ea5a6594eda4ee567d97e1b8111d9'
//for baseTenderly
export const FACTORY_ADDRESS = '0x0fDc7bf21a167A20C49FcA41CCbc3ABa354AcfbD'


export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)

// export let factoryContract = ApeFactoryContract.bind(Address.fromString(FACTORY_ADDRESS))

// rebass tokens, dont count in tracked volume
export let UNTRACKED_PAIRS: string[] = ['0x9ea3b5b4ec044b70375236a281986106457b20ef']

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString('1')
    for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
        bd = bd.times(BigDecimal.fromString('10'))
    }
    return bd
}

export function bigDecimalExp18(): BigDecimal {
    return BigDecimal.fromString('1000000000000000000')
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
    return eth.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18')))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == ZERO_BI) {
        return tokenAmount.toBigDecimal()
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
    const formattedVal = parseFloat(value.toString())
    const zero = parseFloat(ZERO_BD.toString())
    if (zero == formattedVal) {
        return true
    }
    return false
}

export function isNullEthValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenSymbol(tokenAddress: Address): string {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if (staticDefinition != null) {
        return (staticDefinition as TokenDefinition).symbol
    }

    let contract = ERC20.bind(tokenAddress)
    let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

    // try types string and bytes32 for symbol
    let symbolValue = 'unknown'
    let symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {
        let symbolResultBytes = contractSymbolBytes.try_symbol()
        if (!symbolResultBytes.reverted) {
            // for broken pairs that have no symbol function exposed
            if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
                symbolValue = symbolResultBytes.value.toString()
            }
        }
    } else {
        symbolValue = symbolResult.value
    }

    return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if (staticDefinition != null) {
        return (staticDefinition as TokenDefinition).name
    }

    let contract = ERC20.bind(tokenAddress)
    let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

    // try types string and bytes32 for name
    let nameValue = 'unknown'
    let nameResult = contract.try_name()
    if (nameResult.reverted) {
        let nameResultBytes = contractNameBytes.try_name()
        if (!nameResultBytes.reverted) {
            // for broken exchanges that have no name function exposed
            if (!isNullEthValue(nameResultBytes.value.toHexString())) {
                nameValue = nameResultBytes.value.toString()
            }
        }
    } else {
        nameValue = nameResult.value
    }

    return nameValue
}

export function fetchTokenURI(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let tokenURIValue = 'unknown'
    let tokenURIResult = contract.try_tokenURI()
    if (!tokenURIResult.reverted) {
        tokenURIValue = tokenURIResult.value
    }
    return tokenURIValue
}

// HOT FIX: we cant implement try catch for overflow catching so skip total supply parsing on these tokens that overflow
// TODO: find better way to handle overflow
let SKIP_TOTAL_SUPPLY: string[] = ['0x0000000000bf2686748e1c0255036e7617e7e8a5']

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
    if (SKIP_TOTAL_SUPPLY.includes(tokenAddress.toHexString())) {
        return BigInt.fromI32(0)
    }
    const contract = ERC20.bind(tokenAddress)
    let totalSupplyValue = BigInt.zero()
    const totalSupplyResult = contract.try_totalSupply()
    if (!totalSupplyResult.reverted) {
        totalSupplyValue = totalSupplyResult.value
    }
    return totalSupplyValue
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt | null {
    // static definitions overrides
    let staticDefinition = TokenDefinition.fromAddress(tokenAddress)
    if (staticDefinition != null) {
        return (staticDefinition as TokenDefinition).decimals
    }

    let contract = ERC20.bind(tokenAddress)
    let decimalResult = contract.try_decimals()
    if (!decimalResult.reverted) {
        if (BigInt.fromI32(decimalResult.value).lt(BigInt.fromI32(255))) {
            // return decimalResult.value
            return BigInt.fromI32(decimalResult.value)

        }
    }
    return null
}

export function fetchBondingCurveReserveRatio(bondingCurveAddress: Address): BigInt {
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let reserveRatioValue = BigInt.zero()
    let result = contract.try_reserveRatio()
    if (!result.reverted) {
        reserveRatioValue = result.value
    }
    return reserveRatioValue
}

export function fetchBondingCurvePoolBalance(bondingCurveAddress: Address): BigDecimal {
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let poolBalanceValue = BigInt.zero()
    let result = contract.try_poolBalance()
    if (!result.reverted) {
        poolBalanceValue =  result.value
    }
    return convertEthToDecimal(poolBalanceValue)
}

export function fetchBondingCurveCirculatingSupply(bondingCurveAddress: Address): BigDecimal {
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let circulatingSupply = BigInt.zero()
    let result = contract.try_getCirculatingSupply()
    if (!result.reverted) {
        circulatingSupply = result.value
    }
    return convertEthToDecimal(circulatingSupply)
}

export function fetchBondingCurveCurrentPrice(bondingCurveAddress: Address): BigDecimal {
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let currentPrice = BigInt.zero()

    let _supply = contract.try_getCirculatingSupply().value
    let _connectorBalance = contract.try_poolBalance().value
    let _connectorWeight = contract.try_reserveRatio().value
    // let _tokenAmountOut = BigInt.fromString(bigDecimalExp18().toString())
    let _tokenAmountOut = BigInt.fromString('1000000000000000000')

    let result = contract.try_estimateEthInForExactTokensOut(
        _supply , 
        _connectorBalance, 
        _connectorWeight, 
        _tokenAmountOut
    )
    if (!result.reverted) {
        currentPrice = result.value
    }
    return convertEthToDecimal(currentPrice)
}

export function fetchBondingCurveInitialPrice(bondingCurveAddress: Address): BigDecimal {
    let initialPoolBalance = BigInt.fromString('8571428');
    let _initialTokenSupply = BigInt.fromString('1000000000000000000000');
    
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let currentPrice = BigInt.zero()

    let _supply = _initialTokenSupply
    let _connectorBalance = initialPoolBalance
    let _connectorWeight = contract.try_reserveRatio().value
    // let _tokenAmountOut = BigInt.fromString(bigDecimalExp18().toString())
    let _tokenAmountOut = BigInt.fromString('1000000000000000000')

    let result = contract.try_estimateEthInForExactTokensOut(
        _supply,
        _connectorBalance,
        _connectorWeight,
        _tokenAmountOut
    )
    if (!result.reverted) {
        currentPrice = result.value
    }
    return convertEthToDecimal(currentPrice)
}


export function fetchEthAmountToCompleteCurve(bondingCurveAddress: Address): BigDecimal {
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let ethAmountValue = BigInt.zero()
    let result = contract.try_amountToCompleteBondingCurve()
    if (!result.reverted) {
        ethAmountValue = result.value
    }
    return convertEthToDecimal(ethAmountValue)
}

export function fetchTotalEthAmountToCompleteCurve(bondingCurveAddress: Address): BigDecimal {
    let LP_TRANSFER_ETH_AMOUNT = BigInt.fromString('4000000000000000000');
    let LP_TRANSFER_FEE_AMOUNT = BigInt.fromString('200001000000000000');
    let initialPoolBalance = BigInt.fromString('8571428');

    let ethAmountValue = LP_TRANSFER_ETH_AMOUNT.plus(LP_TRANSFER_FEE_AMOUNT).minus(initialPoolBalance)

    return convertEthToDecimal(ethAmountValue)
}

export function fetchTokenAmountToCompleteCurve(bondingCurveAddress: Address): BigDecimal {
    let contract = BondingCurveContract.bind(bondingCurveAddress)
    let tokenAmountValue = BigInt.zero()
    // let result = contract.try_amountToCompleteBondingCurve()

    let _supply = contract.try_getCirculatingSupply().value
    let _connectorBalance = contract.try_poolBalance().value
    let _connectorWeight = contract.try_reserveRatio().value
    let _depositAmount = contract.try_amountToCompleteBondingCurve().value

    let result = contract.try_calculatePurchaseReturn(
        _supply,
        _connectorBalance,
        _connectorWeight,
        _depositAmount,
    )

    if (!result.reverted) {
        tokenAmountValue = result.value
    }
    return convertEthToDecimal(tokenAmountValue)
}

export function fetchTotalTokenAmountToCompleteCurve(bondingCurveAddress: Address): BigDecimal {
    let LP_TRANSFER_ETH_AMOUNT = BigInt.fromString('4000000000000000000');
    let LP_TRANSFER_FEE_AMOUNT = BigInt.fromString('200001000000000000');
    let initialPoolBalance = BigInt.fromString('8571428');
    let ethAmountValue = LP_TRANSFER_ETH_AMOUNT.plus(LP_TRANSFER_FEE_AMOUNT).minus(initialPoolBalance)

    let contract = BondingCurveContract.bind(bondingCurveAddress)

    let _initialTokenSupply = BigInt.fromString('1000000000000000000000');
    // let _connectorBalance = contract.try_poolBalance().value
    let _connectorBalance = initialPoolBalance
    let _connectorWeight = contract.try_reserveRatio().value
    // let _connectorWeight = BigInt.fromString('500000');
    let _depositAmount = ethAmountValue

    let result = contract.try_calculatePurchaseReturn(
        _initialTokenSupply,
        _connectorBalance,
        _connectorWeight,
        _depositAmount,
    )

    return convertEthToDecimal(result.value)
}


// export function fetchBondingCurveUniswapRouter(bondingCurveAddress: Address): Bytes {
//     let contract = BondingCurveContract.bind(bondingCurveAddress)
//     let routerAddress = ADDRESS_ZERO
//     // let result = contract.try_amountToCompleteBondingCurve()
//     let result = contract.try_uniswapV2Router()
//     if (!result.reverted) {
//         routerAddress = result.value.toString()
//     }
//     return routerAddress
// }

export function fetchBondingCurveUniswapRouter(bondingCurveAddress: Address): Bytes {
    let contract = BondingCurveContract.bind(bondingCurveAddress);
    let routerAddress = ADDRESS_ZERO;

    let result = contract.try_uniswapV2Router();
    if (!result.reverted) {
        routerAddress = result.value.toHexString();
    }

    return Bytes.fromHexString(routerAddress);
}
// export function fetchtokenAmountToCompleteCurve(bondingCurveAddress: Address): BigDecimal {
//     let contract = BondingCurveContract.bind(bondingCurveAddress)
//     let poolBalanceValue = BigInt.zero()
//     let result = contract.try_poolBalance()
//     if (!result.reverted) {
//         poolBalanceValue =  result.value
//     }
//     return convertEthToDecimal(poolBalanceValue)
// }
// export function fetchBondingCurvePoolBalance(bondingCurveAddress: Address): BigInt | null {
//     let contract = BondingCurveContract.bind(bondingCurveAddress)
//     let result = contract.try_poolBalance()
//     if (!result.reverted) {
//         return result.value
//     }
//     return null
// }

export function createUser(address: Address): void {
    let user = User.load(address.toHexString())
    if (user === null) {
        user = new User(address.toHexString())
        user.save()
    }
}
