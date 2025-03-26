{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0.25
  },
  "speed": 16,
  "hitMode": "repeat",
  "hitInterval": 400,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 4000,
  "inherit": "",
  "animationId": "b588467c46e18522",
  "motion": "aa9d732244824a32",
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
                  "key": "96efe7ef1b6999bc"
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
      "id": "720160a78c089a18",
      "enabled": true,
      "parameters": {
        "range": 10,
        "angularSpeed": 180,
        "angularSpeedDev": 90
      }
    },
    {
      "id": "e6bc00a65d2cb60d",
      "enabled": true,
      "parameters": {
        "speedDev": 0,
        "angleDev": 0,
        "durationDev": 1000
      }
    },
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "0080ff80",
        "lightRadius": 2,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 200
      }
    }
  ]
}