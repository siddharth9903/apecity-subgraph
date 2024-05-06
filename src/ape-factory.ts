import {
  OwnershipTransferred as OwnershipTransferredEvent,
  TokenCreated as TokenCreatedEvent
} from "../generated/ApeFactory/ApeFactory"
import { OwnershipTransferred, TokenCreated } from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenCreated(event: TokenCreatedEvent): void {
  let entity = new TokenCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.token = event.params.token
  entity.bondingCurve = event.params.bondingCurve
  entity.reserveRatio = event.params.reserveRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
