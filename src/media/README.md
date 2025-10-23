# Media Assets

This folder contains permanent media assets for the FuelTrakr application.

## Files

### logo.tsx
- **DO NOT DELETE** - Core application logo
- Napleton Automotive Group branding
- Used in:
  - SplashScreen.tsx
  - LoginScreen.tsx
  - Any other components requiring the company logo

## Usage

Import the logo in your components:

```tsx
import { napletonLogo } from '../media/logo';

// Then use it in your component:
<img src={napletonLogo} alt="Napleton Automotive Group" />
```

## Important Notes

- This is a **permanent folder** - do not delete or move these files
- The logo is essential for branding consistency across the application
- If you need to update the logo, replace it in `logo.tsx` only - do not change the export name
