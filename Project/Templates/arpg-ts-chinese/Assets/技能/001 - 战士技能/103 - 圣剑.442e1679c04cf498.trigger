{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "rectangle",
    "width": 12,
    "height": 1.5,
    "anchor": 0
  },
  "speed": 0,
  "hitMode": "once",
  "hitInterval": 400,
  "initialDelay": 800,
  "effectiveTime": 100,
  "duration": 0,
  "inherit": "",
  "animationId": "b588467c46e18522",
  "motion": "6ff216e290e6b75e",
  "priority": 0,
  "offsetY": -4,
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
              "key": "knockbackAngle"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "object",
                "property": "trigger-angle",
                "trigger": {
                  "type": "trigger"
                }
              }
            ]
          }
        },
        {
          "id": "translateActor",
          "params": {
            "actor": {
              "type": "trigger"
            },
            "angle": {
              "type": "absolute",
              "degrees": {
                "type": "local",
                "key": "knockbackAngle"
              }
            },
            "distance": 2,
            "easingId": "7890d8edf5d88412",
            "duration": 200,
            "wait": false
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
                  "key": "96efe7ef1b6999bc"
                }
              },
              {
                "operation": "mul",
                "type": "constant",
                "value": 4
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
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "ffffa040",
        "lightRadius": 16,
        "intensity": 0,
        "fadein": 500,
        "fadeout": 1000
      }
    }
  ]
}