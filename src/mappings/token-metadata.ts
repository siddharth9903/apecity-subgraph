import { Bytes, dataSource, json } from '@graphprotocol/graph-ts'
import { TokenMetaData } from '../types/schema'

export function handleTokenMetadata(content: Bytes): void {
    const cid = dataSource.stringParam()
    const tokenMetaData = new TokenMetaData(cid)

    const value = json.fromBytes(content).toObject()
    if (value) {
        const name = value.get('name')
        const symbol = value.get('symbol')
        const image = value.get('image')
        const description = value.get('description')
        const twitter = value.get('twitter')
        const telegram = value.get('telegram')
        const website = value.get('website')

        if (name && symbol && image && description) {
            tokenMetaData.name = name.toString()
            tokenMetaData.symbol = symbol.toString()
            tokenMetaData.image = image.toString()
            tokenMetaData.description = description.toString()

            if (twitter) {
                tokenMetaData.twitter = twitter.toString()
            }

            if (telegram) {
                tokenMetaData.telegram = telegram.toString()
            }

            if (website) {
                tokenMetaData.website = website.toString()
            }
        }
    }

    tokenMetaData.save()
}