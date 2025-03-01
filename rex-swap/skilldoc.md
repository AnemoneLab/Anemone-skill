# Swap Skill Documentation

## Skill Name
**Swap Tokens**

## Skill Description
The `Swap Tokens` skill enables users to swap one token for another on the Sui blockchain using the Cetus Aggregator. It securely decrypts the user's private key and performs the swap while ensuring minimal slippage.

## API Documentation

### Endpoint
`POST /swap`

### Request Body
The request must be a JSON object containing the following parameters:

| Parameter    | Type   | Description |
|-------------|--------|-------------|
| `encryptedKey` | `string` | The user's encrypted SUI private key, which will be decrypted on the server. |
| `fromToken` | `string` | The address of the token to swap from. |
| `toToken` | `string` | The address of the token to swap to. |
| `amount` | `string` or `number` | The amount of `fromToken` to swap (in base units). |
| `slippage` | `number` (optional) | The maximum acceptable slippage percentage (default: 0.01 = 1%). |

### Example Request
```json
{
  "encryptedKey": "<ENCRYPTED_PRIVATE_KEY>",
  "fromToken": "0x123...abc",
  "toToken": "0x456...def",
  "amount": "1000000",
  "slippage": 0.01
}
```

### Response
The response will be a JSON object containing the transaction result.

| Parameter    | Type   | Description |
|-------------|--------|-------------|
| `success` | `boolean` | Indicates whether the swap was successful. |
| `transactionDigest` | `string` | The transaction digest of the executed swap. |
| `message` | `string` | A message indicating the result of the transaction. |
| `error` | `string` (if applicable) | An error message if the swap fails. |

### Example Success Response
```json
{
  "success": true,
  "transactionDigest": "0xabcdef1234567890",
  "message": "交易成功完成"
}
```

### Example Error Response
```json
{
  "success": false,
  "error": "No swap route found"
}
```

