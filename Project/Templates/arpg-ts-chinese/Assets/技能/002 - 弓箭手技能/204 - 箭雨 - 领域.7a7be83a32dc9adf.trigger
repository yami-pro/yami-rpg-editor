{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0
  },
  "speed": 0,
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 0,
  "inherit": "",
  "animationId": "e94d71029f9e8e66",
  "motion": "efe1fa8d082c5cff",
  "priority": -10,
  "offsetY": 0,
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
              "key": "radius"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "constant",
                "value": 4
              }
            ]
          }
        },
        {
          "id": "setNumber",
          "params": {
            "variable": {
              "type": "local",
              "key": "quantity"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "constant",
                "value": 200
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
                  "key": "quantity"
                },
                "operation": "greater",
                "operand": {
                  "type": "constant",
                  "value": 0
                }
              }
            ],
            "commands": [
              {
                "id": "setNumber",
                "params": {
                  "variable": {
                    "type": "local",
                    "key": "quantity"
                  },
                  "operation": "sub",
                  "operands": [
                    {
                      "operation": "add",
                      "type": "constant",
                      "value": 1
                    }
                  ]
                }
              },
              {
                "id": "setNumber",
                "params": {
                  "variable": {
                    "type": "local",
                    "key": "angle"
                  },
                  "operation": "set",
                  "operands": [
                    {
                      "operation": "add",
                      "type": "constant",
                      "value": 360
                    },
                    {
                      "operation": "mul",
                      "type": "math",
                      "method": "random"
                    }
                  ]
                }
              },
              {
                "id": "setNumber",
                "params": {
                  "variable": {
                    "type": "local",
                    "key": "distance"
                  },
                  "operation": "set",
                  "operands": [
                    {
                      "operation": "add",
                      "type": "variable",
                      "variable": {
                        "type": "local",
                        "key": "radius"
                      }
                    },
                    {
                      "operation": "mul",
                      "type": "math",
                      "method": "random"
                    }
                  ]
                }
              },
              {
                "id": "createTrigger",
                "params": {
                  "triggerId": "18dfcf92fee364d3",
                  "caster": {
                    "type": "trigger"
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
                      "key": "angle"
                    }
                  },
                  "distance": {
                    "type": "local",
                    "key": "distance"
                  },
                  "scale": 1,
                  "timeScale": {
                    "type": "actor",
                    "actor": {
                      "type": "trigger"
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
                    "key": "random"
                  },
                  "operation": "set",
                  "operands": [
                    {
                      "operation": "add",
                      "type": "math",
                      "method": "random-int",
                      "min": 0,
                      "max": 2
                    }
                  ]
                }
              },
              {
                "id": "switch",
                "params": {
                  "variable": {
                    "type": "local",
                    "key": "random"
                  },
                  "branches": [
                    {
                      "conditions": [
                        {
                          "type": "number",
                          "value": 0
                        }
                      ],
                      "commands": [
                        {
                          "id": "playAudio",
                          "params": {
                            "type": "se-attenuated",
                            "audio": "d93329f7c015fc61",
                            "volume": 0.5,
                            "location": {
                              "type": "trigger",
                              "trigger": {
                                "type": "latest"
                              }
                            }
                          }
                        }
                      ]
                    },
                    {
                      "conditions": [
                        {
                          "type": "number",
                          "value": 1
                        }
                      ],
                      "commands": [
                        {
                          "id": "playAudio",
                          "params": {
                            "type": "se-attenuated",
                            "audio": "4ae670a79da2402e",
                            "volume": 0.5,
                            "location": {
                              "type": "trigger",
                              "trigger": {
                                "type": "latest"
                              }
                            }
                          }
                        }
                      ]
                    },
                    {
                      "conditions": [
                        {
                          "type": "number",
                          "value": 2
                        }
                      ],
                      "commands": [
                        {
                          "id": "playAudio",
                          "params": {
                            "type": "se-attenuated",
                            "audio": "f59e41150bb2ea0d",
                            "volume": 0.5,
                            "location": {
                              "type": "trigger",
                              "trigger": {
                                "type": "latest"
                              }
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "id": "wait",
                "params": {
                  "duration": 25
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
        "lightColor": "80ffff80",
        "lightRadius": 6,
        "intensity": 0,
        "fadein": 200,
        "fadeout": 200
      }
    }
  ]
}