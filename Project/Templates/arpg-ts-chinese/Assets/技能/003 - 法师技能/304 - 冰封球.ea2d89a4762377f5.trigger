{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0
  },
  "speed": 4,
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 1500,
  "inherit": "",
  "animationId": "1fd96a521f0c9814",
  "motion": "b6e9990a79420ba4",
  "priority": 0,
  "offsetY": -4,
  "rotatable": true,
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
              "key": "launchAngle"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "constant",
                "value": 0
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
                "id": "createTrigger",
                "params": {
                  "triggerId": "ceb8ab22092b4c9b",
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
                    "degrees": {
                      "type": "local",
                      "key": "launchAngle"
                    }
                  },
                  "distance": 0,
                  "scale": 1,
                  "timeScale": {
                    "type": "actor",
                    "actor": {
                      "type": "caster"
                    },
                    "key": "6421aebf4c298605"
                  }
                }
              },
              {
                "id": "setNumber",
                "params": {
                  "variable": {
                    "type": "local",
                    "key": "launchAngle"
                  },
                  "operation": "add",
                  "operands": [
                    {
                      "operation": "add",
                      "type": "constant",
                      "value": 50
                    }
                  ]
                }
              },
              {
                "id": "wait",
                "params": {
                  "duration": 50
                }
              }
            ]
          }
        }
      ]
    },
    {
      "type": "destroy",
      "enabled": true,
      "commands": [
        {
          "id": "setNumber",
          "params": {
            "variable": {
              "type": "local",
              "key": "launchAngle"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "constant",
                "value": 0
              }
            ]
          }
        },
        {
          "id": "loop",
          "params": {
            "mode": "all",
            "conditions": [
              {
                "type": "number",
                "variable": {
                  "type": "local",
                  "key": "launchAngle"
                },
                "operation": "less",
                "operand": {
                  "type": "constant",
                  "value": 360
                }
              }
            ],
            "commands": [
              {
                "id": "createTrigger",
                "params": {
                  "triggerId": "ceb8ab22092b4c9b",
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
                    "degrees": {
                      "type": "local",
                      "key": "launchAngle"
                    }
                  },
                  "distance": 0,
                  "scale": 1,
                  "timeScale": {
                    "type": "actor",
                    "actor": {
                      "type": "caster"
                    },
                    "key": "6421aebf4c298605"
                  }
                }
              },
              {
                "id": "setNumber",
                "params": {
                  "variable": {
                    "type": "local",
                    "key": "launchAngle"
                  },
                  "operation": "add",
                  "operands": [
                    {
                      "operation": "add",
                      "type": "constant",
                      "value": 15
                    }
                  ]
                }
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
        "lightColor": "80c0ff80",
        "lightRadius": 6,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 100
      }
    }
  ]
}