# Score File Format
Score uploads are represented as JSONs. This is the format that "Batch-Manual" import method will expect.

## 1. Meta
Metadata about the upload

- `game`: The internal name used for the game
- `playtype`: How the game was played (single/doubles). Or some playstyle. This key is largely here to track whatever it is you find relevant
- `service`: Note about where this score came from

### Internal Game Names
- DANCERUSH = `dancerush`
- DANCE aROUND = `dancearound`
- Project DIVA Arcade: Future Tone = `diva`
- MUSIC DIVER = `musicdiver`
- Nostalgia = `nostalgia`
- REFLEC BEAT = `reflecbeat`
- Taiko no Tatsujin Arcade = `taiko`

## 2. Scores
This section is pretty dynamic, and you can technically add whatever key is relevant to the game. However for each score the following keys are mandatory

- `timestamp`: UNIX timestamp in ms for when the score achieved. Set as 0 to indicate N/A
- `title`: Name of the chart
- `artist`: Name of the artist/charter
- `score`: Some numerical value representing the score

> The combination of title + artist should be unique for each chart. Try and make it so that everyone uploads referencing title/artist in the same language to prevent duplicates.

Everything else is fully optional. The more you add, the more is displayed. Games with built-in support already have pre-defined formats that I highly recommend you use. These were largely based on what data was available via the import methods.

More documentation on the exact format for each game is to come, but for now taking a look at the [relevant import scripts](https://github.com/pinapelz/Mirage/tree/main/scripts) should give a good enough idea about what a score for that game should look like.

### Judgements and Optional Section
These sub-objects are pre-defined sections for certain attributes. Everything that is "important" goes in the root of the score object. Judgements has its own section, and everything kinda not important but might be useful goes into optional.

```json
{
  "meta": {
    "game": "taiko",
    "playtype": "Single",
    "service": "SAMPLE TAIKO SCORE"
  },
  "scores": [
    {
      "title": "オトノケ",
      "timestamp": 1762939574000,
      "artist": "TVアニメ「ダンダダン」より",
      "difficulty": "HARD",
      "level": 6,
      "crown_rank": "CLEAR",
      "score_rank": "IKI 3",
      "score": 732950,
      "judgements": {
        "good": 192,
        "ok": 151,
        "bad": 23
      },
      "optional": {
        "combo": 61
      }
    }
  ]
}

```
