{
  "selector": "enemy",
  "onHitWalls": "destroy",
  "onHitActors": "destroy",
  "hitCount": 2,
  "shape": {
    "type": "rectangle",
    "width": 3,
    "height": 1,
    "anchor": 0.5
  },
  "speed": 10,
  "hitMode": "once",
  "hitInterval": 400,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 4000,
  "inherit": "",
  "animationId": "62d9236c4746f761",
  "motion": "202fbc71a3bd6fc8",
  "priority": 0,
  "offsetY": -4,
  "rotatable": true,
  "events": [
    {
      "type": "hitactor",
      "enabled": true,
      "commands": [
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
                  }
                ]
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
          "id": "playAnimation",
          "params": {
            "mode": "position",
            "position": {
              "type": "trigger",
              "trigger": {
                "type": "trigger"
              }
            },
            "animationId": "62d9236c4746f761",
            "motion": "f564a24ccb748042",
            "rotatable": true,
            "priority": 1,
            "offsetY": -4,
            "angle": 0,
            "speed": 1,
            "wait": false
          }
        }
      ]
    }
  ],
  "scripts": []
}