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
  "animationId": "d37fa15080fd801f",
  "motion": "bd8f93259986f442",
  "priority": 0,
  "offsetY": 0,
  "rotatable": false,
  "events": [
    {
      "type": "autorun",
      "enabled": true,
      "commands": [
        {
          "id": "f4b25e9faf168b8d",
          "params": {
            "mode": "position",
            "position": {
              "getter": "position",
              "type": "trigger",
              "trigger": {
                "type": "trigger"
              }
            },
            "actor": {
              "getter": "actor",
              "type": "trigger"
            },
            "lightColor": "ff60aa80",
            "lightRadius": 4,
            "intensity": 0,
            "duration": 1000,
            "fadein": 200,
            "fadeout": 200
          }
        }
      ]
    },
    {
      "type": "destroy",
      "enabled": true,
      "commands": [
        {
          "id": "setObject",
          "params": {
            "variable": {
              "type": "global",
              "key": "1c9c7609f00bac2f"
            },
            "operand": {
              "type": "actor",
              "actor": {
                "type": "caster"
              }
            }
          }
        },
        {
          "id": "createActor",
          "params": {
            "actorId": "cf6500f87ceb350d",
            "teamId": "09eae4cd86f61848",
            "position": {
              "type": "trigger",
              "trigger": {
                "type": "trigger"
              }
            },
            "angle": 0
          }
        }
      ]
    }
  ],
  "scripts": []
}