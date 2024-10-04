# my-rate-limiter
Designing and implementing an efficient rate limiter.

## Design

### System Design

#### High level design
![System Design](/docs/design/Rate%20Limiter-System%20Diagram.jpg)

#### Sequence Diagram
1. Calling API - GET /api1 for which rate limiter is not applicable, the rate limiter will allow the request and the service is process the request further and send a response appropriately.
2. Calling API - GET /api2 for which rate limiter is applicable, the rate limiter will return too many requests error and subsequently the service will return 429 to the client.
3. Calling API - GET /api2 for which rate limiter is applicable, the rate limiter will return success and subsequently the service will process the request and send a response.

![Sequence Diagram](/docs/design/Rate%20Limiter-Sequence%20Diagram.jpg)

#### Rate limiter flowchart

![Rate limiter flowchart](/docs/design/Rate%20Limiter-Flowchart.jpg)

### Redis Design

1. Use sorted sets with key as "RATE_LIMIT_<USER_ID>_<API_PATH>_<API_METHOD>".
2. Use zRemRangeByScore to remove the expired tokens - pass the sorted set key, min value and max value of tokens that are to be removed.
3. Use ZCard for a given key to identify the number of tokens used.
4. Use zAdd to add a new token to a sorted set for a given key with the request timestamp as the score and member id.