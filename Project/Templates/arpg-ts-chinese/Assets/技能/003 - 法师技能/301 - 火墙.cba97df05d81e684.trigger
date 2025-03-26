{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 2
  },
  "speed": 0,
  "hitMode": "repeat",
  "hitInterval": 500,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 10000,
  "inherit": "",
  "animationId": "1fd96a521f0c9814",
  "motion": "a848d7938b833835",
  "priority": 2,
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
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "ffffa080",
        "lightRadius": 10,
        "intensity": 0,
        "fadein": 100,
        "fadeout": 200
      }
    }
  ]
}