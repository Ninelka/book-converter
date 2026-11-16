# Testing

Use Node.js 22.13 or later.

```sh
npm ci
npm test
npm run test:coverage
npm run typecheck
npm run lint
```

Jest with the Expo preset and React Native Testing Library covers file selection,
format selection, validation, settings persistence, send/save actions, busy state,
errors and cancellation. Service tests verify multipart construction, binary/base64
integrity, timeout and cleanup, mail statuses and Android/iOS save behavior.

Native file, picker, mail, sharing and network APIs are mocked at their boundaries.
The tests exercise application components, hooks and services rather than sending
real email or contacting the deployed converter. Coverage reports are written to
`coverage/` (ignored by Git).

Before the fixes, regression tests failed for oversized uploads, the save action,
mail cancellation/status handling and cancelling settings edits.

The upload limit is 4 MiB, leaving room for multipart headers within the Vercel
request limit. Android saves to a user-selected directory. iOS offers the system
save/share sheet and keeps the converted document; Android email handoff and the
iOS share sheet do not prove delivery or saving, so the UI does not claim success.

Manual device verification is still needed for the Android directory picker,
iOS Save to Files and actual mail attachments. Rebuild a native iOS app after the
`expo-file-system` plugin change to expose its documents in Files.
