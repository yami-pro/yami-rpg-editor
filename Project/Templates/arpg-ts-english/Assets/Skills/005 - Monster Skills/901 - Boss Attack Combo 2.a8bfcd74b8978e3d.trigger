{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 5
  },
  "speed": 0,
  "hitMode": "once",
  "hitInterval": 400,
  "initialDelay": 100,
  "effectiveTime": 0,
  "duration": 100,
  "inherit": "",
  "animationId": "",
  "motion": "",
  "priority": 0,
  "offsetY": 0,
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
                  "key": "96efe7ef1b6999bc"
                }
              },
              {
                "operation": "mul",
                "type": "constant",
                "value": 1.25
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
  "scripts": []
}