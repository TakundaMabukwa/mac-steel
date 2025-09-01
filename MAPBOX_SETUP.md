# Mapbox Integration Setup Guide

## Overview
The utilization dashboard now includes a "View Current Location" button for each vehicle that opens a Mapbox GL map showing the vehicle's real-time location.

## Features
- **Real-time vehicle tracking** on an interactive map
- **Custom vehicle markers** with vehicle information
- **Navigation controls** (zoom, pan, fullscreen)
- **Get Directions** button that opens Google Maps
- **Responsive design** that works on all screen sizes
- **Error handling** for vehicles without GPS coordinates

## Setup Instructions

### 1. Get a Mapbox Access Token
1. Go to [Mapbox Account](https://account.mapbox.com/access-tokens/)
2. Sign up or log in to your Mapbox account
3. Create a new access token or use your default public token
4. Copy the token (it starts with `pk.`)

### 2. Configure Environment Variables
Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

**Important:** The token must start with `NEXT_PUBLIC_` to be accessible in the browser.

### 3. Restart Your Development Server
After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
# or
yarn dev
```

## How It Works

### Vehicle Cards
- Each vehicle card in the utilization dashboard now shows a "View Current Location" button
- The button only appears for vehicles that have GPS coordinates (`latitude` and `longitude`)
- Clicking the button opens a full-screen map dialog

### Map Features
- **Automatic zoom**: The map automatically zooms to level 16 and flies to the vehicle's location
- **Custom markers**: Blue circular markers with location icons and green status indicators
- **Interactive popups**: Click on markers to see vehicle details
- **Navigation controls**: Zoom in/out, pan, and fullscreen options
- **Get Directions**: Opens Google Maps with the vehicle's location as the destination

### Error Handling
- **No coordinates**: Shows "Location Unavailable" message for vehicles without GPS data
- **Invalid coordinates**: Handles cases where coordinates are 0,0 or invalid
- **Loading states**: Shows loading spinner while the map initializes

## Technical Details

### Dependencies
- **Mapbox GL JS**: Loaded dynamically from CDN (v2.15.0)
- **React Dialog**: Uses the existing UI dialog component
- **TypeScript**: Full type safety for vehicle data

### Performance
- **Dynamic loading**: Mapbox GL JS is only loaded when needed
- **Efficient rendering**: Map is initialized once and reused
- **Memory management**: Markers are properly cleaned up

### Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile support**: Responsive design for mobile devices
- **Fallback**: Graceful degradation for unsupported browsers

## Customization

### Map Style
You can change the map style by modifying this line in `VehicleLocationMap.tsx`:

```typescript
style: 'mapbox://styles/mapbox/streets-v12'
```

Available styles:
- `mapbox://styles/mapbox/streets-v12` (default)
- `mapbox://styles/mapbox/outdoors-v12`
- `mapbox://styles/mapbox/light-v11`
- `mapbox://styles/mapbox/dark-v11`
- `mapbox://styles/mapbox/satellite-v9`

### Marker Appearance
Customize the vehicle markers by modifying the `createCustomMarker` function:

```typescript
const createCustomMarker = (vehicle: LiveVehicle) => {
  // Customize marker HTML and styling here
};
```

### Zoom Levels
Adjust the zoom behavior by changing these values:

```typescript
// Initial zoom when map opens
zoom: 15

// Zoom when flying to vehicle location
zoom: 16

// Fly animation duration (milliseconds)
duration: 2000
```

## Troubleshooting

### Map Not Loading
1. Check that your Mapbox token is valid
2. Verify the environment variable is set correctly
3. Check browser console for error messages
4. Ensure you have an active internet connection

### No Vehicle Locations
1. Verify that vehicles have valid `latitude` and `longitude` values
2. Check that coordinates are not 0,0 (invalid GPS signal)
3. Ensure the vehicle data is being fetched correctly

### Performance Issues
1. Check if too many vehicles are being displayed
2. Verify that the map is being properly cleaned up
3. Consider implementing virtual scrolling for large vehicle lists

## Security Notes

- **Public token**: The Mapbox token used is a public token designed for client-side use
- **Rate limiting**: Be aware of Mapbox's rate limits for your account tier
- **Data privacy**: Vehicle coordinates are only displayed to authorized users

## Support

For issues with:
- **Mapbox service**: Contact [Mapbox Support](https://support.mapbox.com/)
- **Application integration**: Check the browser console and application logs
- **Vehicle data**: Verify your database and API endpoints

## Future Enhancements

Potential improvements:
- **Real-time updates**: Live location updates without refreshing
- **Route tracking**: Show vehicle movement history
- **Geofencing**: Alert when vehicles enter/exit specific areas
- **Multi-vehicle view**: Show all vehicles on one map
- **Offline support**: Cache map tiles for offline use
