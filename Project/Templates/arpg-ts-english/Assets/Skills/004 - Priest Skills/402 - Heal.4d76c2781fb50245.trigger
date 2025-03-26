{
  "selector": "team",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 20
  },
  "speed": 0,
  "hitMode": "once",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 100,
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
          "id": "playAnimation",
          "params": {
            "mode": "actor",
            "actor": {
              "type": "trigger"
            },
            "animationId": "d37fa15080fd801f",
            "motion": "ec797e040f8abf4e",
            "rotatable": true,
            "priority": 1,
            "offsetY": 0,
            "angle": 0,
            "speed": 1,
            "wait": false
          }
        },
        {
          "id": "f4b25e9faf168b8d",
          "params": {
            "mode": "actor",
            "position": {
              "getter": "position",
              "type": "absolute",
              "x": 0,
              "y": 0
            },
            "actor": {
              "getter": "actor",
              "type": "trigger"
            },
            "lightColor": "00ffff40",
            "lightRadius": 4,
            "intensity": 0,
            "duration": 2800,
            "fadein": 200,
            "fadeout": 200
          }
        },
        {
          "id": "setNumber",
          "params": {
            "variable": {
              "type": "actor",
              "actor": {
                "type": "trigger"
              },
              "key": "a5fd5e9f229abb2d"
            },
            "operation": "add",
            "operands": [
              {
                "operation": "add",
                "type": "variable",
                "variable": {
                  "type": "actor",
                  "actor": {
                    "type": "trigger"
                  },
                  "key": "91e7127e267f9425"
                }
              },
              {
                "operation": "mul",
                "type": "constant",
                "value": 4
              }
            ]
          }
        },
        {
          "id": "callEvent",
          "params": {
            "type": "global",
            "eventId": "877c64fd64f297ac"
          }
        }
      ]
    }
  ],
  "scripts": []
}