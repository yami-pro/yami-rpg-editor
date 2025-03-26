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
          "id": "changeActorState",
          "params": {
            "actor": {
              "type": "trigger"
            },
            "operation": "add",
            "stateId": "5408cef4ed5f402c"
          }
        }
      ]
    }
  ],
  "scripts": []
}