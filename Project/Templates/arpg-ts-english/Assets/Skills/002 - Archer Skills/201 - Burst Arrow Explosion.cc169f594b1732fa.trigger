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
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 100,
  "duration": 0,
  "inherit": "",
  "animationId": "e94d71029f9e8e66",
  "motion": "d2f908a9b67d8b99",
  "priority": 0,
  "offsetY": 0,
  "rotatable": false,
  "events": [
    {
      "type": "autorun",
      "enabled": true,
      "commands": [
        {
          "id": "playAudio",
          "params": {
            "type": "se-attenuated",
            "audio": "d05811cf81be5d24",
            "volume": 0.5,
            "location": {
              "type": "trigger",
              "trigger": {
                "type": "trigger"
              }
            }
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
                "value": 10
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
                            "type": "trigger",
                            "trigger": {
                              "type": "trigger"
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
                      "distance": 2,
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
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "ffffa0c0",
        "lightRadius": 10,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 200
      }
    }
  ]
}