# diwata_api

**Auth Token** 
```
curl -X POST "https://diwata.site/api/v1/diwata/auth/token" \
    -H "x-server-key": {server_key} \
```

response:

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjAxNzU3OTEsImV4cCI6MTcyMDE3OTM5MX0.q_i9jH60mM6A5d408z9iIwvL3F-CCK8yLmzd4nIMdEE"
}
```

**Send Gold** 
```
curl -X POST "https://diwata.site/api/v1/diwata/gift/gold" \
    -H "authorization": {token} \
```

response:
```
{
    "sender": {
        "balance": {
            "amount": "7809",
            "created_at": "2024-06-23T10:56:26Z",
            "currency_id": "01J0HS6B9GJ3CV1H0G2ZYFHS0D",
            "wallet_id": "01J12BSRAGHD4VG5ZAX921G4AV"
        }
    },
    "receiver": {
        "balance": {
            "amount": "40277",
            "created_at": "2024-07-02T01:24:25Z",
            "currency_id": "01J0HS6B9GJ3CV1H0G2ZYFHS0D",
            "wallet_id": "01J1RGP06HJV0H8JXEYVGQWFK1"
        }
    }
}
```

