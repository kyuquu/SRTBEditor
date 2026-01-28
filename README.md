# SRTBEditor
A web-based application for viewing and editing .srtb files for Spin Rhythm XD

https://kyuquu.github.io/SRTBEditor/

## Features

### Chart loading and saving
- Create a new chart, upload a file from your computer, or load a chart directly from SpinSha.re via its API
- Save your chart as a .zip (with audio and album art included), a standalone .srtb, or a more readable .json

### Chart editing
- **Basic View:** Update your chart's metadata, album art, audio, difficulty ratings, and more via a user-friendly interface

- **JSON View:** Inspect and edit the raw chart data in an organized and more accessible format

### Chart utilities
- View additional information about your chart, such as precise note counts, max score, and max combo
- Get automated feedback for things like misplaced notes, mistimed stacks, and invisible notes
- Access various utility functions (note stacking, flight path mirroring, chart merging)
- !roll

## Feedback
If you encounter any bugs or other issues, you can:
- create an issue in the GitHub repository
- send a message in the [thread](https://discord.com/channels/638508804505337867/1392735727837778013) attached to the pinned message in `#charter-discussion`
- DM `@kyuquu` or `@gaviguy` on Discord

## Known Issues
- Charts with multiple audio files are not fully supported
- Some edge cases might cause issues (eg. missing or out-of-order fields, ancient .srtb formats, etc.)
