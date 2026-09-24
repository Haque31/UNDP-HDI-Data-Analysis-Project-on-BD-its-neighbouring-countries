# API Response Reference

The API runs on `http://localhost:5000` by default. All endpoints return JSON and allow cross-origin requests.

## `GET /api/countries`

```json
[
  {"iso3":"BGD","name":"Bangladesh"},
  {"iso3":"IND","name":"India"},
  {"iso3":"PAK","name":"Pakistan"},
  {"iso3":"CHN","name":"China"}
]
```

## `GET /api/hdi-trend`

Returns 136 HDI records and 3 historical markers.

```json
{
  "hdi_trend": [
    {"iso3":"BGD","year":1990,"hdi":0.397},
    {"iso3":"CHN","year":1990,"hdi":0.491},
    {"iso3":"IND","year":1990,"hdi":0.446},
    {"iso3":"PAK","year":1990,"hdi":0.396},
    "...",
    {"iso3":"BGD","year":2023,"hdi":0.685},
    {"iso3":"CHN","year":2023,"hdi":0.797},
    {"iso3":"IND","year":2023,"hdi":0.685},
    {"iso3":"PAK","year":2023,"hdi":0.544}
  ],
  "historical_markers": [
    {"year":1971,"label":"Bangladesh independence"},
    {"year":1978,"label":"China economic reforms begin"},
    {"year":1991,"label":"India economic liberalization"}
  ]
}
```

## `GET /api/components`

```json
[
  {"iso3":"BGD","le":74.672,"eys":12.31016827,"mys":6.789999962,"gnipc":8497.658639},
  {"iso3":"CHN","le":77.953,"eys":15.4787495,"mys":8.036181597,"gnipc":22029.22253},
  {"iso3":"IND","le":72.003,"eys":12.95454025,"mys":6.880000114,"gnipc":9046.756336},
  {"iso3":"PAK","le":67.649,"eys":7.89510849,"mys":4.316987038,"gnipc":5501.132932}
]
```

## `GET /api/inequality-gap`

Returns 56 records covering 2010-2023. Some source values are `null`.

```json
[
  {"iso3":"BGD","year":2010,"hdi":0.561,"ihdi":0.385,"loss_pct":31.37254902},
  {"iso3":"BGD","year":2011,"hdi":0.572,"ihdi":0.395,"loss_pct":30.94405594},
  "...",
  {"iso3":"CHN","year":2010,"hdi":0.71,"ihdi":null,"loss_pct":null},
  "...",
  {"iso3":"PAK","year":2023,"hdi":0.544,"ihdi":0.364,"loss_pct":33.08823529}
]
```

## `GET /api/gii-trend`

Returns 136 records covering 1990-2023. Missing GII values are `null`.

```json
[
  {"iso3":"BGD","year":1990,"gii":0.7},
  {"iso3":"CHN","year":1990,"gii":null},
  {"iso3":"IND","year":1990,"gii":0.697},
  {"iso3":"PAK","year":1990,"gii":0.8},
  "...",
  {"iso3":"BGD","year":2023,"gii":0.487},
  {"iso3":"CHN","year":2023,"gii":0.132},
  {"iso3":"IND","year":2023,"gii":0.403},
  {"iso3":"PAK","year":2023,"gii":0.536}
]
```