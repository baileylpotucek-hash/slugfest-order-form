# Slugfest Shirt Store

## Setup

1. Upload this folder to GitHub.
2. Put your shirt images in `public/images`:
   - `shirt-front-back.png`
   - `shirt-front.png`
   - `shirt-back.png`
3. In `src/App.jsx`, replace:
   - `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
   - `PASTE_YOUR_VENMO_LINK_HERE`

## Google Sheet Tabs

Create these tabs in the Google Sheet named `Slugfest Shirt Order Form`.

### Orders
Headers:

Submitted At | Name | Phone | Email | Address | Shipping Needed | Venmo Name | Paid | Pickup | Notes | Order Total | Item Count | Items JSON | Status

### Order Items
Headers:

Submitted At | Name | Phone | Email | Shirt Type | Shirt Brand | Color | Size | Quantity | Unit Price | Line Total | Paid | Shipping Needed | Status

## Apps Script

Use the `apps-script.js` file included in this folder.

1. Open the Google Sheet.
2. Extensions > Apps Script.
3. Paste `apps-script.js`.
4. Replace `PASTE_SPREADSHEET_ID_HERE` with your Google Sheet ID.
5. Deploy as Web App.
6. Execute as: Me.
7. Access: Anyone.
8. Copy the `/exec` URL into `src/App.jsx`.

## AWS Amplify

1. Create a GitHub repo.
2. Upload these files.
3. AWS Amplify > Create new app > GitHub.
4. Select repo and `main` branch.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Save and deploy.
