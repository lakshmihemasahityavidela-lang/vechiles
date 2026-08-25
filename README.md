# FlowSync — AI-Based Green Corridor Management

A fast, software-only SIH 2026 prototype for **Code Zen (Team ID 864)**. The dashboard demonstrates emergency vehicle requests, local traffic prediction inputs, ranked route options, a simulated map, dynamic route recalculation, and signal priority coordination.

## Run locally

This version is intentionally dependency-free and works on a Windows computer without paid services. Open `index.html` directly in a browser, or serve the folder with any static server. With Python installed, run:

```bash
python -m http.server 8090
```

Then open `http://localhost:8090`.

## Included interactions

Create a simulated ambulance, fire truck, or police request; choose Critical, High, or Normal priority; run the local traffic predictor with density, speed, vehicle count, and road-length inputs; find a ranked route; trigger a traffic event to switch route recommendations; simulate a vehicle pass to release priority signals; and use the quick navigation links to focus the map, traffic, or signal sections.

## Prototype boundary

Map roads, vehicle location, traffic values, ETA, and signal states are generated in the browser for demonstration. The prototype does not connect to physical traffic signals, live GPS, camera detection, Firebase, IoT hardware, or paid APIs. It is intended as a clear foundation for the SIH live demo and future Flask/Scikit-learn integration.

## Files

- `index.html` — dashboard markup and simulated map layout
- `styles.css` — dark operations UI, responsive layout, map styling, and animations
- `app.js` — browser interactions and local prediction/recalculation logic
