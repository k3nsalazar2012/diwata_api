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
    -d "{\"sender_id\": 6320090, \"receiver_id\": 6320618}, \"amount\": 100"
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


**Send Book of Faces / Scrolls of Nature** 
```
curl -X POST "https://diwata.site/api/v1/diwata/gift/asset" \
    -H "authorization": {token} \
    -d "{\"player_id\": 6320618, \"asset_id\": 664824}"
```

response:
```
{
    "status": {
        "items": [
            {
                "instance_id": 47633251,
                "variation_id": null,
                "rental_option_id": null,
                "acquisition_source": "grant_server_api",
                "asset": {
                    "id": 664824,
                    "live_asset_id": 664823,
                    "has_changes": 0,
                    "context_id": 235255,
                    "asset_type_id": null,
                    "default_variation_id": null,
                    "rarity_id": null,
                    "price": 0,
                    "sales_price": 0,
                    "popular": 0,
                    "popularity_score": 0,
                    "name": "Bathala",
                    "type": "5",
                    "active": 1,
                    "purchasable": 0,
                    "rentable": 0,
                    "unique_instance": 0,
                    "min_game_version_id": null,
                    "marked_new": "2024-06-16 23:40:50",
                    "created_at": "2024-06-16 23:40:50",
                    "updated_at": "2024-06-23 00:34:36",
                    "deleted_at": null,
                    "uuid": "1acd4855-a9ff-415e-af3e-47fc3674d689",
                    "ulid": "01J0HPSJABDB926VA0EDDXYA1J"
                },
                "rental": {
                    "is_rental": false,
                    "time_left": null,
                    "duration": null,
                    "is_active": null
                }
            }
        ]
    }
}
```
