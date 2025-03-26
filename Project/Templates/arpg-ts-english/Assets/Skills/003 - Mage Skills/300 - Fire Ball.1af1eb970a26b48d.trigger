{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate-destroy",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0.5
  },
  "speed": 8,
  "hitMode": "once",
  "hitInterval": 400,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 3000,
  "inherit": "",
  "animationId": "1fd96a521f0c9814",
  "motion": "77e80af2f5e29e56",
  "priority": 0,
  "offsetY": -4,
  "rotatable": true,
  "events": [
    {
      "type": "hitactor",
      "enabled": true,
      "commands": [
        {
          "id": "playAnimation",
          "params": {
            "mode": "actor",
            "actor": {
              "type": "trigger"
            },
            "animationId": "1fd96a521f0c9814",
            "motion": "0afacb0de87a087e",
            "rotatable": true,
            "priority": 0,
            "offsetY": 4,
            "angle": 0,
            "speed": 1,
            "wait": false
          }
        },
        {
          "id": "f4b25e9faf168b8d",
          "params": {
            "mode": "actor",
            "position": {
              "getter": "position",
              "type": "actor",
              "actor": {
                "type": "trigger"
              }
            },
            "actor": {
              "getter": "actor",
              "type": "trigger"
            },
            "lightColor": "ffffa080",
            "lightRadius": 4,
            "intensity": 0,
            "duration": 400,
            "fadein": 100,
            "fadeout": 100
          }
        },
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
          "id": "playAudio",
          "params": {
            "type": "se-attenuated",
            "audio": "e4812ddc27757918",
            "volume": 0.5,
            "location": {
              "type": "actor",
              "actor": {
                "type": "trigger"
              }
            }
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
        "lightColor": "ffffa040",
        "lightRadius": 4,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 100
      }
    }
  ]
}