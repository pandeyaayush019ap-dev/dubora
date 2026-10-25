# API Reference Specification — DUBORA

All authenticated endpoints require an authorized workspace session. Requests with JSON payloads must specify `Content-Type: application/json`.

---

## 1. Projects API

### `POST /api/projects`
Create a new video localization project draft.

**Request Body:**
```json
{
  "title": "Product Launch Keynote 2026",
  "sourceLanguage": "en",
  "targetLanguages": ["es", "de", "ja"],
  "workspaceId": "ws-default"
}
```

**Response (201 Created):**
```json
{
  "project": {
    "id": "0641fc30-8187-4708-b344-169a98f8f6d0",
    "workspaceId": "ws-default",
    "title": "Product Launch Keynote 2026",
    "sourceLanguage": "en",
    "targetLanguages": ["es", "de", "ja"],
    "status": "draft",
    "createdAt": "2026-10-25T17:12:14.518Z",
    "updatedAt": "2026-10-25T17:12:14.518Z"
  }
}
```

---

### `GET /api/projects/:id`
Retrieve project details, associated media assets, dubbing jobs, and export links.

**Response (200 OK):**
```json
{
  "project": {
    "id": "0641fc30-8187-4708-b344-169a98f8f6d0",
    "title": "Product Launch Keynote 2026",
    "status": "completed",
    "durationSeconds": 2.0,
    "originalVideoUrl": "http://localhost:3000/api/media/stream?key=...",
    "thumbnailUrl": "http://localhost:3000/api/media/stream?key=..."
  },
  "assets": [],
  "jobs": [],
  "exports": [],
  "transcript": {}
}
```

---

## 2. Media Ingestion & Streaming

### `POST /api/projects/:id/uploads`
Upload raw source video file (`multipart/form-data`).

**Parameters:**
- `file`: Video binary (MP4, MOV, WebM, MKV; max 150MB).

**Response (200 OK):**
```json
{
  "success": true,
  "asset": {
    "id": "84bf77aa-e8ec-4e1d-a33e-a541c39de5ee",
    "assetType": "original_video",
    "fileSize": 23206,
    "durationSeconds": 2.0,
    "metadata": {
      "width": 320,
      "height": 240,
      "frameRate": 25,
      "videoCodec": "h264",
      "audioCodec": "aac"
    }
  },
  "probe": {
    "durationSeconds": 2.0,
    "audioChannels": 1,
    "audioSampleRate": 44100
  }
}
```

---

### `GET /api/media/stream?key={storageKey}`
Authenticated video streaming endpoint with full HTTP 206 Partial Content (Range header) support for smooth seeking.

**Headers:**
- `Range: bytes=0-1024`

**Response (206 Partial Content):**
- `Content-Range: bytes 0-1024/23206`
- `Content-Type: video/mp4`

---

## 3. Dubbing Pipeline

### `POST /api/projects/:id/dub`
Dispatch an asynchronous dubbing job for a specific target language.

**Request Body:**
```json
{
  "targetLanguage": "es"
}
```

**Response (202 Accepted):**
```json
{
  "job": {
    "id": "cd33ac27-106a-42a2-a4f2-700e7202a3e7",
    "projectId": "0641fc30-8187-4708-b344-169a98f8f6d0",
    "targetLanguage": "es",
    "status": "queued",
    "stage": "initializing",
    "progress": 5
  }
}
```

---

## 4. Studio Transcript Editing

### `PATCH /api/segments/:id`
Persist user edits to localized dialogue in real time.

**Request Body:**
```json
{
  "translatedText": "Bienvenido a Dubora. Demostramos el doblaje con IA.",
  "status": "edited"
}
```

**Response (200 OK):**
```json
{
  "segment": {
    "id": "seg-1",
    "translatedText": "Bienvenido a Dubora. Demostramos el doblaje con IA.",
    "status": "edited"
  }
}
```

---

## 5. Health & Diagnostic API

### `GET /api/health`
Returns live configuration diagnostics for background workers and AI provider adapters.

**Response (200 OK):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "services": {
    "elevenlabs": { "configured": true, "missingEnvVar": null },
    "openai": { "configured": true, "missingEnvVar": null },
    "ffmpeg": { "installed": true, "version": "N-92722" },
    "storage": { "provider": "local", "ready": true }
  }
}
```
