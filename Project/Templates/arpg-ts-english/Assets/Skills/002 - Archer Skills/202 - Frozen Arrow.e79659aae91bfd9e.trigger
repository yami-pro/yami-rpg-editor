{
  "selector": "enemy",
  "onHitWalls": "destroy",
  "onHitActors": "destroy",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 0.5
  },
  "speed": 12,
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 3000,
  "inherit": "",
  "animationId": "e94d71029f9e8e66",
  "motion": "fda60ae49e6f1f90",
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
                "value": 5
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
                    "id": "changeActorState",
                    "params": {
                      "actor": {
                        "type": "trigger"
                      },
                      "operation": "add",
                      "stateId": "3d9bdf6c68aeff80"
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
        "lightColor": "0000ffc0",
        "lightRadius": 3,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 0
      }
    }
  ]
}