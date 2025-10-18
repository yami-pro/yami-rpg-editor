{
  "selector": "enemy",
  "onHitWalls": "destroy",
  "onHitActors": "destroy",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 1
  },
  "speed": 16,
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 3000,
  "inherit": "",
  "animationId": "e94d71029f9e8e66",
  "motion": "f0da5e02f905a7a2",
  "priority": 0,
  "offsetY": -4,
  "rotatable": true,
  "events": [
    {
      "type": "autorun",
      "enabled": true,
      "commands": [
        {
          "id": "loop",
          "params": {
            "mode": "all",
            "conditions": [],
            "commands": [
              {
                "id": "wait",
                "params": {
                  "duration": 100
                }
              },
              {
                "id": "f4b25e9faf168b8d",
                "params": {
                  "mode": "position",
                  "position": {
                    "getter": "position",
                    "type": "trigger",
                    "trigger": {
                      "type": "trigger"
                    }
                  },
                  "actor": {
                    "getter": "actor",
                    "type": "trigger"
                  },
                  "lightColor": "ffd04040",
                  "lightRadius": 4,
                  "intensity": 0,
                  "duration": 500,
                  "fadein": 100,
                  "fadeout": 400
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
            "eventId": "ba6b4ddc82cea0d5"
          }
        },
        {
          "id": "createTrigger",
          "params": {
            "triggerId": "cc169f594b1732fa",
            "caster": {
              "type": "caster"
            },
            "origin": {
              "type": "trigger",
              "trigger": {
                "type": "trigger"
              }
            },
            "angle": {
              "type": "absolute",
              "degrees": 0
            },
            "distance": 0,
            "scale": 1,
            "timeScale": 1
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
        "lightColor": "ffd04080",
        "lightRadius": 4,
        "intensity": 0,
        "direct": 0.25,
        "fadein": 0,
        "fadeout": 0
      }
    }
  ]
}