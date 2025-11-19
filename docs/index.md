**Mirage** is a "rhythm" game score tracker that doesn’t rely on predefined seeds or chart metadata. It preserves your scores across games, even niche ones.

This means that Mirage starts out with *zero* information about what charts belong to what games. You, as the user tell it what charts exist in a game when you upload scores.

It's self-hostable and supports multiple users, so you can compare results across the same charts.

# Supported games

Mirage comes with built-in support for a few games. These games already have customized displays, theming, and methods to import scores.

- DANCERUSH
- DANCE aROUND
- Project DIVA Arcade: Future Tone
- MUSIC DIVER
- Nostalgia
- REFLEC BEAT
- Taiko no Tatsujin Arcade

You can also add non-default as a "Generic" using the Admin UI. Mirage will attempt to generate a decent looking UI for displaying that game's score as they come in (until you manually write in full support). However, at a bare minimum it will serve its purpose as a place to keep that score file safe.

## Other Notes
The focus of the tracker is "Arcade Rhythm" games, however technically speaking it works for any game you want. Mirage makes it easy to add tracking for not-so popular games, [Tachi](https://github.com/zkldi/Tachi) is the better more robust score tracking solution. In fact, its highly suggested you use that when possible to track games that have well-documented databases of charts (seeds).

# Documentation
- [Score File Format](./score)
