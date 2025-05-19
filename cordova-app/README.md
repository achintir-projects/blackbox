# Packaging Next.js Website into Android App using Cordova

This guide explains how to package your Next.js website into an Android app using Apache Cordova.

## Prerequisites

- Node.js and npm installed
- Cordova CLI installed globally: `npm install -g cordova`
- Android SDK and environment set up for Cordova Android builds
- Your Next.js website source code

## Steps

1. Build and export your Next.js website as static files:

```bash
npm run build
npm run export
```

This will generate a static version of your site in the `out` directory.

2. Create a new Cordova project:

```bash
cordova create cordova-app com.example.app MyApp
cd cordova-app
```

3. Add the Android platform:

```bash
cordova platform add android
```

4. Copy the exported static site files into the Cordova `www` directory:

```bash
rm -rf www/*
cp -r ../out/* www/
```

5. Build the Cordova Android app:

```bash
cordova build android
```

6. Run the app on an emulator or device:

```bash
cordova run android
```

## Notes

- Make sure your Next.js site is fully static and does not rely on server-side rendering or API routes, as Cordova apps serve static files.
- If your site uses API routes, consider hosting the API separately and updating your frontend to call the hosted API.
- You can customize the Cordova app by editing `config.xml` and adding plugins as needed.
