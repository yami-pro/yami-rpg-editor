{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 1
  },
  "speed": 4,
  "hitMode": "repeat",
  "hitInterval": 400,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 0,
  "inherit": "",
  "animationId": "1fd96a521f0c9814",
  "motion": "feef287d2c1ebc2a",
  "priority": 0,
  "offsetY": 0,
  "rotatable": false,
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
                "value": 1.25
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
        }
      ]
    }
  ],
  "scripts": [
    {
      "id": "720160a78c089a18",
      "enabled": true,
      "parameters": {
        "range": 10,
        "angularSpeed": 540,
        "angularSpeedDev": 0
      }
    },
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "ffffff40",
        "lightRadius": 6,
        "intensity": 0,
        "fadein": 100,
        "fadeout": 200
      }
    }
  ]
}