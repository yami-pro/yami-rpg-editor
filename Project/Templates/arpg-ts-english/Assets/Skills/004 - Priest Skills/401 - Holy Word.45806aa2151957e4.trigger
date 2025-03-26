{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0.5
  },
  "speed": 0,
  "hitMode": "once-on-overlap",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 5000,
  "inherit": "",
  "animationId": "d37fa15080fd801f",
  "motion": "7909c02c48f29edb",
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
          "id": "callEvent",
          "params": {
            "type": "global",
            "eventId": "72a36c94f48af009"
          }
        },
        {
          "id": "if",
          "params": {
            "branches": [
              {
                "mode": "all",
                "conditions": [
                  {
                    "type": "actor",
                    "actor": {
                      "type": "trigger"
                    },
                    "operation": "active"
                  }
                ],
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
                          "type": "math",
                          "method": "relative-angle",
                          "start": {
                            "type": "actor",
                            "actor": {
                              "type": "caster"
                            }
                          },
                          "end": {
                            "type": "actor",
                            "actor": {
                              "type": "trigger"
                            }
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
                      "distance": 0.5,
                      "easingId": "7890d8edf5d88412",
                      "duration": 200,
                      "wait": false
                    }
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ],
  "scripts": [
    {
      "id": "dff6b51e230af1d3",
      "enabled": true,
      "parameters": {
        "angularSpeed": 180
      }
    },
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "ffffa020",
        "lightRadius": 6,
        "intensity": 0,
        "fadein": 100,
        "fadeout": 100
      }
    }
  ]
}