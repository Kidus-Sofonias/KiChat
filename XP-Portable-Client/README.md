# KiChat XP Portable Client

This folder is a copyable legacy frontend for old Windows XP machines.

## What it does

- Connects to your hosted KiChat backend
- Supports sign in and sign up
- Shows all users and recent chats
- Loads conversation history
- Sends text messages
- Uses polling instead of Socket.IO for better old-browser compatibility

## What it does not do

- No voice recording
- No live socket transport
- No rich media preview
- No guaranteed support in Internet Explorer

## Recommended XP browser

Use a browser with modern HTTPS and JavaScript support on XP, such as Firefox 52 ESR or MyPal.

## Setup

1. Open `config.js`
2. Replace `https://your-hosted-backend.example.com` with your real backend URL
3. Copy this whole `XP-Portable-Client` folder to the XP machine
4. Open `index.html` in the browser

## Backend note

If the XP browser sends `Origin: null` for local files, enable this on the hosted backend:

`ALLOW_NULL_ORIGIN=true`

That support was added in `Backend/app.js`.

## Important

If the XP machine cannot reach modern HTTPS sites because of TLS or certificate limitations, the client still will not be able to talk to the hosted backend until the browser supports that connection.
