{
  "selector": "enemy",
  "onHitWalls": "destroy",
  "onHitActors": "penetrate-destroy",
  "hitCount": 3,
  "shape": {
    "type": "circle",
    "radius": 0.5
  },
  "speed": 10,
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 3000,
  "inherit": "",
  "animationId": "e94d71029f9e8e66",
  "motion": "4a6cec6cfcca2f96",
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
        }
      ]
    }
  ],
  "scripts": [
    {
      "id": "4acd97b2c159796f",
      "enabled": true,
      "parameters": {
        "lightColor": "00ffff40",
        "lightRadius": 4,
        "intensity": 0,
        "fadein": 0,
        "fadeout": 0
      }
    }
  ]
}