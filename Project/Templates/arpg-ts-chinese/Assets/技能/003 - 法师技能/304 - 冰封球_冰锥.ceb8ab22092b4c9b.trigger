{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0.5
  },
  "speed": 6,
  "hitMode": "once",
  "hitInterval": 400,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 2000,
  "inherit": "",
  "animationId": "1fd96a521f0c9814",
  "motion": "d6995c7a6dd3c27d",
  "priority": 0,
  "offsetY": -4,
  "rotatable": true,
  "events": [
    {
      "type": "hitactor",
      "enabled": true,
      "commands": [
        {
          "id": "setNumber",
          "params": {
            "variable": {
              "type": "local",
              "key": "damage"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "variable",
                "variable": {
                  "type": "actor",
                  "actor": {
                    "type": "caster"
                  },
                  "key": "91e7127e267f9425"
                }
              },
              {
                "operation": "mul",
                "type": "constant",
                "value": 2
              },
              {
                "operation": "sub",
                "type": "variable",
                "variable": {
                  "type": "actor",
                  "actor": {
                    "type": "trigger"
                  },
                  "key": "9c18a64439c1368f"
                }
              }
            ]
          }
        },
        {
          "id": "callEvent",
          "params": {
            "type": "global",
            "eventId": "4e99a6dee0a8602b"
          }
        },
        {
          "id": "callEvent",
          "params": {
            "type": "global",
            "eventId": "72a36c94f48af009"
          }
        }
      ]
    }
  ],
  "scripts": [
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "80c0ff40",
        "lightRadius": 2,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 100
      }
    }
  ]
}