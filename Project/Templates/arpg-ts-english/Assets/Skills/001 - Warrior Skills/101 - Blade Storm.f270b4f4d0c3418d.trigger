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
  "hitInterval": 266,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 4000,
  "inherit": "",
  "animationId": "b588467c46e18522",
  "motion": "a188bd6768b2f545",
  "priority": 0,
  "offsetY": -4,
  "rotatable": false,
  "events": [
    {
      "type": "autorun",
      "enabled": true,
      "commands": [
        {
          "id": "setNumber",
          "params": {
            "variable": {
              "type": "local",
              "key": "time"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "constant",
                "value": 266
              },
              {
                "operation": "div",
                "type": "variable",
                "variable": {
                  "type": "actor",
                  "actor": {
                    "type": "caster"
                  },
                  "key": "6421aebf4c298605"
                }
              }
            ]
          }
        },
        {
          "id": "loop",
          "params": {
            "mode": "all",
            "conditions": [],
            "commands": [
              {
                "id": "callEvent",
                "params": {
                  "type": "global",
                  "eventId": "ae18447779cd5aac"
                }
              },
              {
                "id": "wait",
                "params": {
                  "duration": {
                    "type": "local",
                    "key": "time"
                  }
                }
              }
            ]
          }
        }
      ]
    },
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
                  "key": "96efe7ef1b6999bc"
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
                  "key": "752c94a8aa99161b"
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
      "id": "c5c6d838fb26afda",
      "enabled": true,
      "parameters": {}
    },
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "80ffff40",
        "lightRadius": 2,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 0
      }
    }
  ]
}