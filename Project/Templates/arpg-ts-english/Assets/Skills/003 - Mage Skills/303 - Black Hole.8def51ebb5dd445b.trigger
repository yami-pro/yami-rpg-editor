{
  "selector": "enemy",
  "onHitWalls": "penetrate",
  "onHitActors": "penetrate",
  "hitCount": 2,
  "shape": {
    "type": "circle",
    "radius": 2
  },
  "speed": 2,
  "hitMode": "repeat",
  "hitInterval": 0,
  "initialDelay": 0,
  "effectiveTime": 0,
  "duration": 0,
  "inherit": "",
  "animationId": "1fd96a521f0c9814",
  "motion": "17564b58ac27b9ad",
  "priority": -1,
  "offsetY": -4,
  "rotatable": false,
  "events": [
    {
      "type": "hitactor",
      "enabled": true,
      "commands": [
        {
          "id": "translateActor",
          "params": {
            "actor": {
              "type": "trigger"
            },
            "angle": {
              "type": "position",
              "position": {
                "type": "trigger",
                "trigger": {
                  "type": "trigger"
                }
              }
            },
            "distance": 0.5,
            "easingId": "01eac96676bb2ee7",
            "duration": 100,
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
        "lightColor": "0000ff80",
        "lightRadius": 6,
        "intensity": 0,
        "fadein": 100,
        "fadeout": 100
      }
    }
  ]
}