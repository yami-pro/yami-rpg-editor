{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 1.5
  },
  "speed": 6,
  "hitMode": "repeat",
  "hitInterval": 200,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 2000,
  "inherit": "",
  "animationId": "b588467c46e18522",
  "motion": "07f29292c7aa7674",
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
              "key": "delay"
            },
            "operation": "set",
            "operands": [
              {
                "operation": "add",
                "type": "constant",
                "value": 500
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
          "id": "wait",
          "params": {
            "duration": {
              "type": "local",
              "key": "delay"
            }
          }
        },
        {
          "id": "setTriggerSpeed",
          "params": {
            "trigger": {
              "type": "trigger"
            },
            "speed": 0
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
            "animationId": "b588467c46e18522",
            "motion": "b4f2b345fa11c818",
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
  "scripts": [
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "ff000080",
        "lightRadius": 3,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 0
      }
    }
  ]
}